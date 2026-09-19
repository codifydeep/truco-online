import { describe, expect, test } from "vitest";
import { SHARED_SCHEMA_VERSION } from "../server/version.js";

describe("server re-export of shared base schema version (TDD-01)", () => {
  test("server re-exports the frozen base schema version", () => {
    expect(SHARED_SCHEMA_VERSION).toBe("1.0.0");
  });
});
