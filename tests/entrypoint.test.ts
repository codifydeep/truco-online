import { test, expect } from "vitest";
import type { AddressInfo } from "node:net";
import { listenTarget, start } from "../server/main.js";

test("listenTarget defaults to host 0.0.0.0 and port 8080", () => {
  expect(listenTarget({})).toEqual({ host: "0.0.0.0", port: 8080 });
});

test("listenTarget honors non-default HOST and PORT env", () => {
  expect(listenTarget({ HOST: "127.0.0.1", PORT: "9123" })).toEqual({
    host: "127.0.0.1",
    port: 9123,
  });
});

test("start binds the app on the env-specified non-default HOST/PORT", async () => {
  const port = 8123;
  const server = await start({ HOST: "127.0.0.1", PORT: String(port) });
  try {
    const addr = server.server?.address();
    expect(typeof addr).toBe("object");
    const info = addr as AddressInfo;
    expect(String(info.address)).toBe("127.0.0.1");
    expect(Number(info.port)).toBe(port);
  } finally {
    await server.close();
  }
});
