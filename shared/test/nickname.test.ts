import { describe, expect, test } from "vitest";
import { normalizeNickname } from "../src/nickname.js";

describe("nickname normalization and validation (LOB-05)", () => {
  test("trims surrounding whitespace from a valid nickname", () => {
    const r = normalizeNickname("  bob  ");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe("bob");
  });

  test("rejects an empty-after-trim nickname with NICKNAME_EMPTY", () => {
    const r = normalizeNickname("   ");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("NICKNAME_EMPTY");
  });

  test("rejects a nickname longer than 20 chars with NICKNAME_INVALID", () => {
    const r = normalizeNickname("a".repeat(21));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("NICKNAME_INVALID");
  });

  test("accepts exactly 20 characters as valid (inclusive)", () => {
    const r = normalizeNickname("a".repeat(20));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toHaveLength(20);
  });
});
