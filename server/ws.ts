import type { FastifyInstance } from "fastify";
import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import { WebSocketServer } from "ws";

export interface SocketServer {
  close(): void;
}

// WebSocket transport on the shared origin (/ws), per ADR D4/D6. Built on the
// maintained `ws` library rather than a hand-rolled RFC 6455 framing layer.
// Binds to the Fastify-underlying Node http server, handles only the /ws
// upgrade path, and echoes decoded frames back on the same connection,
// preserving the original text/binary frame type. No sessions/rooms logic
// lives here.
export function createSocketServer(app: FastifyInstance): SocketServer {
  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", (socket) => {
    socket.on("message", (data, isBinary) => {
      socket.send(isBinary ? data : data.toString());
    });
  });

  app.server.on(
    "upgrade",
    (req: IncomingMessage, socket: Duplex, head: Buffer) => {
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
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    }
  );

  return {
    close() {
      for (const client of wss.clients) client.terminate();
      wss.close();
    },
  };
}
