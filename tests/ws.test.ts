import { test, expect } from "vitest";
import { buildApp } from "../server/app.js";
import { createSocketServer } from "../server/ws.js";

test("ws: /ws handshake + echo round-trip of one JSON frame", async () => {
  const app = buildApp();
  const wss = createSocketServer(app);
  const ref: { ws: WebSocket | null } = { ws: null };
  try {
    await app.listen({ port: 0, host: "127.0.0.1" });
    const addr = app.server.address();
    const port = typeof addr === "object" && addr !== null ? addr.port : 0;
    expect(port).toBeGreaterThan(0);

    const url = `ws://127.0.0.1:${port}/ws`;
    const payload = JSON.stringify({ type: "echo", n: 1 });

    const reply = await new Promise<string>((resolve) => {
      ref.ws = new WebSocket(url);
      ref.ws.onopen = () => ref.ws!.send(payload);
      ref.ws.onmessage = (ev) => resolve(String(ev.data));
      ref.ws.onerror = () => resolve("");
      setTimeout(() => resolve(""), 5000);
    });

    expect(reply).toBe(payload);
  } finally {
    ref.ws?.close();
    wss.close();
    await app.close();
  }
}, 10000);
