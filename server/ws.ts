import type { FastifyInstance } from "fastify";
import { createHash } from "node:crypto";
import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";

const WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

interface Frame {
  opcode: number;
  payload: Buffer;
  consumed: number;
}

export interface SocketServer {
  close(): void;
}

// Minimal WebSocket transport on the shared origin (/ws), per ADR D4/D6.
// Binds to the Fastify-underlying Node http server and handles only the /ws
// upgrade path, using RFC 6455 framing. No sessions/rooms logic lives here.
export function createSocketServer(app: FastifyInstance): SocketServer {
  const sockets = new Set<Duplex>();

  app.server.on("upgrade", (req, socket, head) => {
    let pathname: string;
    try {
      pathname = new URL(req.url ?? "/", "http://localhost").pathname;
    } catch {
      socket.destroy();
      return;
    }
    if (pathname !== "/ws") {
      socket.destroy();
      return;
    }
    acceptUpgrade(req, socket, head, sockets);
  });

  return {
    close() {
      for (const socket of sockets) socket.destroy();
      sockets.clear();
    }
  };
}

function acceptUpgrade(
  req: IncomingMessage,
  socket: Duplex,
  head: Buffer,
  sockets: Set<Duplex>
): void {
  const key = req.headers["sec-websocket-key"];
  if (typeof key !== "string") {
    socket.destroy();
    return;
  }
  const accept = createHash("sha1")
    .update(key + WS_GUID)
    .digest("base64");
  socket.write(
    "HTTP/1.1 101 Switching Protocols\r\n" +
      "Upgrade: websocket\r\n" +
      "Connection: Upgrade\r\n" +
      `Sec-WebSocket-Accept: ${accept}\r\n\r\n`
  );
  sockets.add(socket);
  socket.on("close", () => sockets.delete(socket));
  socket.on("error", () => socket.destroy());
  handleConnection(socket, head);
}

function handleConnection(socket: Duplex, initial: Buffer): void {
  let buffer = initial;
  socket.on("data", (chunk: Buffer) => {
    buffer = Buffer.concat([buffer, chunk]);
    let frame: Frame | null;
    while ((frame = readFrame(buffer))) {
      buffer = buffer.subarray(frame.consumed);
      if (frame.opcode === 0x8) {
        // close frame -> reply then drop
        writeFrame(socket, 0x8, frame.payload.subarray(0, 2));
        socket.destroy();
        return;
      }
      if (frame.opcode === 0x9) {
        // ping -> pong
        writeFrame(socket, 0xa, frame.payload);
        continue;
      }
      if (frame.opcode === 0xa) continue; // pong, ignore
      if (frame.opcode === 0x1) {
        // text frame -> echo payload back
        writeFrame(socket, 0x1, frame.payload);
        continue;
      }
      socket.destroy();
      return;
    }
  });
}

function readFrame(buf: Buffer): Frame | null {
  if (buf.length < 2) return null;
  const opcode = buf[0] & 0x0f;
  const masked = (buf[1] & 0x80) !== 0;
  let len = buf[1] & 0x7f;
  let offset = 2;
  if (len === 126) {
    if (buf.length < 4) return null;
    len = buf.readUInt16BE(2);
    offset = 4;
  } else if (len === 127) {
    if (buf.length < 10) return null;
    const big = buf.readBigUInt64BE(2);
    if (big > BigInt(Number.MAX_SAFE_INTEGER)) return null;
    len = Number(big);
    offset = 10;
  }
  let maskKey: Buffer | null = null;
  if (masked) {
    if (buf.length < offset + 4) return null;
    maskKey = buf.subarray(offset, offset + 4);
    offset += 4;
  }
  if (buf.length < offset + len) return null;
  let payload = buf.subarray(offset, offset + len);
  if (maskKey) {
    payload = Buffer.from(payload);
    for (let i = 0; i < payload.length; i++) payload[i] ^= maskKey[i & 3];
  }
  return { opcode, payload, consumed: offset + len };
}

function writeFrame(socket: Duplex, opcode: number, payload: Buffer): void {
  const len = payload.length;
  const header: number[] = [0x80 | opcode];
  if (len < 126) header.push(len);
  else if (len < 65536) header.push(126);
  else header.push(127);
  const head = Buffer.from(header);
  let ext: Buffer;
  if (len < 126) {
    ext = Buffer.alloc(0);
  } else if (len < 65536) {
    ext = Buffer.alloc(2);
    ext.writeUInt16BE(len, 0);
  } else {
    ext = Buffer.alloc(8);
    ext.writeBigUInt64BE(BigInt(len), 0);
  }
  socket.write(Buffer.concat([head, ext, payload]));
}
