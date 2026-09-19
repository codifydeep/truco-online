import { describe, expect, test } from "vitest";
import {
  decodeHttpError,
  decodeWsError,
  encodeHttpError,
  encodeWsError,
  ERROR_CODES,
  ERROR_HTTP_STATUS,
  type HttpErrorEnvelope,
  type WsErrorEnvelope,
} from "../src/errors.js";

describe("canonical error register", () => {
  test("registers exactly the seven canonical error codes", () => {
    expect([...ERROR_CODES]).toEqual([
      "NICKNAME_EMPTY",
      "NICKNAME_INVALID",
      "SESSION_INVALID",
      "SESSION_ALREADY_IN_ROOM",
      "ROOM_NOT_FOUND",
      "ROOM_FULL",
      "INVALID_OPERATION",
    ]);
  });

  test("association with ERROR_HTTP_STATUS covers every canonical code", () => {
    for (const code of ERROR_CODES) {
      expect(ERROR_HTTP_STATUS[code]).toBeTypeOf("number");
    }
  });

  test("canonical HTTP status per code matches the approved ADR", () => {
    expect(ERROR_HTTP_STATUS).toEqual({
      NICKNAME_EMPTY: 422,
      NICKNAME_INVALID: 422,
      SESSION_INVALID: 401,
      SESSION_ALREADY_IN_ROOM: 409,
      ROOM_NOT_FOUND: 404,
      ROOM_FULL: 409,
      INVALID_OPERATION: 400,
    });
  });
});

describe("HTTP error envelope", () => {
  test("encodes the unified { error: { code, message, requestId } } shape", () => {
    expect(
      JSON.parse(encodeHttpError("ROOM_NOT_FOUND", "Room not found.", "req-42"))
    ).toEqual({
      error: {
        code: "ROOM_NOT_FOUND",
        message: "Room not found.",
        requestId: "req-42",
      },
    });
  });

  test("decodes an HTTP error envelope back to its typed shape", () => {
    const parsed = decodeHttpError(
      JSON.stringify({
        error: { code: "ROOM_FULL", message: "Room full.", requestId: "req-9" },
      })
    );
    expect(parsed.error.code).toBe("ROOM_FULL");
    expect(parsed.error.message).toBe("Room full.");
    expect(parsed.error.requestId).toBe("req-9");
  });

  test("HTTP encode/decode round-trips through the same envelope", () => {
    const envelope: HttpErrorEnvelope = {
      error: {
        code: "SESSION_INVALID",
        message: "Expired.",
        requestId: "req-7",
      },
    };
    expect(
      decodeHttpError(
        encodeHttpError(
          envelope.error.code,
          envelope.error.message,
          envelope.error.requestId
        )
      )
    ).toEqual(envelope);
  });
});

describe("WebSocket error envelope", () => {
  test("encodes the unified { type: 'error', data: { code, message } } shape", () => {
    expect(JSON.parse(encodeWsError("INVALID_OPERATION", "Invalid op."))).toEqual({
      type: "error",
      data: { code: "INVALID_OPERATION", message: "Invalid op." },
    });
  });

  test("decodes a WebSocket error envelope with type 'error'", () => {
    const parsed = decodeWsError(
      JSON.stringify({
        type: "error",
        data: { code: "NICKNAME_EMPTY", message: "Empty." },
      })
    );
    expect(parsed.type).toBe("error");
    expect(parsed.data.code).toBe("NICKNAME_EMPTY");
    expect(parsed.data.message).toBe("Empty.");
  });

  test("WS encode/decode round-trips through the same envelope", () => {
    const envelope: WsErrorEnvelope = {
      type: "error",
      data: { code: "SESSION_ALREADY_IN_ROOM", message: "Already inside." },
    };
    expect(decodeWsError(encodeWsError(envelope.data.code, envelope.data.message))).toEqual(
      envelope
    );
  });
});
