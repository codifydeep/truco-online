import { describe, expect, test } from "vitest";
import { generateRequestId } from "../src/errors.js";

describe("crypto-random requestId generation (TDD-01a)", () => {
  test("returns a well-formed RFC 4122 UUIDv4-shaped id", () => {
    expect(generateRequestId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });

  test("is non-deterministic across calls", () => {
    const first = generateRequestId();
    const second = generateRequestId();
    expect(first).not.toBe(second);
  });
});
