import { describe, expect, test } from "vitest";
import {
  errorEnvelope,
  ERROR_CODES,
  type ErrorCode,
} from "../server/errors.js";

// Canonical human-readable message per error code, per the approved ADR error
// contract consumed by both HTTP and WS.
const DEFAULT_MESSAGES: Record<ErrorCode, string> = {
  NICKNAME_EMPTY: "Nickname must not be empty.",
  NICKNAME_INVALID: "Nickname is invalid.",
  SESSION_INVALID: "Session is invalid or has expired.",
  SESSION_ALREADY_IN_ROOM: "Session is already in a room.",
  ROOM_NOT_FOUND: "Room not found.",
  ROOM_FULL: "Room is full.",
  INVALID_OPERATION: "Invalid operation.",
  RATE_LIMITED: "Rate limit exceeded. Try again later.",
};

describe("errorEnvelope", () => {
  test("covers every canonical error code with a canonical message", () => {
    for (const code of ERROR_CODES) {
      const envelope = errorEnvelope(code, "req-1");
      expect(envelope.error.code).toBe(code);
      expect(envelope.error.message).toBe(DEFAULT_MESSAGES[code]);
    }
  });

  test("serializes the unified { error: { code, message, requestId } } shape", () => {
    expect(errorEnvelope("ROOM_NOT_FOUND", "req-42")).toEqual({
      error: {
        code: "ROOM_NOT_FOUND",
        message: "Room not found.",
        requestId: "req-42",
      },
    });
  });

  test("passes the caller-provided requestId through unchanged", () => {
    const requestId = "9f86d081-884c-7d87-4b2f-4a6e-3dfe701a5c92";
    expect(errorEnvelope("RATE_LIMITED", requestId).error.requestId).toBe(
      requestId
    );
    expect(errorEnvelope("RATE_LIMITED", requestId).error.code).toBe(
      "RATE_LIMITED"
    );
  });

  test("allows an explicit message to override the canonical default", () => {
    const envelope = errorEnvelope("SESSION_INVALID", "req-7", "Expired.");
    expect(envelope.error.message).toBe("Expired.");
    expect(envelope.error.code).toBe("SESSION_INVALID");
    expect(envelope.error.requestId).toBe("req-7");
  });
});
