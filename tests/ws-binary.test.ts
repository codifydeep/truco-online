import { test, expect } from "vitest";
import { WebSocket as WsClient, type RawData } from "ws";
import { buildApp } from "../server/app.js";
import { createSocketServer } from "../server/ws.js";

test("ws: /ws echoes a binary frame back on the same connection", async () => {
  const app = buildApp();
  const wss = createSocketServer(app);
  const ref: { ws: WsClient | null } = { ws: null };
  try {
    await app.listen({ port: 0, host: "127.0.0.1" });
    const addr = app.server.address();
    const port = typeof addr === "object" && addr !== null ? addr.port : 0;
    expect(port).toBeGreaterThan(0);

    const payload = Buffer.from([0, 1, 2, 3, 0xfe, 0xff]);
    const url = `ws://127.0.0.1:${port}/ws`;

    const reply = await new Promise<Buffer>((resolve) => {
      ref.ws = new WsClient(url);
      ref.ws.on("open", () => ref.ws!.send(payload));
      ref.ws.on("message", (data: RawData) => resolve(data as Buffer));
      ref.ws.on("error", () => resolve(Buffer.alloc(0)));
      setTimeout(() => resolve(Buffer.alloc(0)), 5000);
    });

    expect(reply.equals(payload)).toBe(true);
  } finally {
    ref.ws?.close();
    wss.close();
    await app.close();
  }
}, 10000);
