// Shared value-level error contract for Truco v0.1 (TDD-01 increment).
// Pure and transport-agnostic: no session/room state, no I/O, no HTTP/WS
// coupling. Message text is intentionally NOT defined here (message rendering
// is LOB-05/frontend); this module only registers the canonical codes and their
// HTTP statuses and serializes the unified HTTP/WS error envelopes. Consumed by
// server and web from TDD-02 onward.

/** The eight canonical Truco v0.1 error codes, per the approved ADR. */
export const ERROR_CODES = [
  "NICKNAME_EMPTY",
  "NICKNAME_INVALID",
  "SESSION_INVALID",
  "SESSION_ALREADY_IN_ROOM",
  "ROOM_NOT_FOUND",
  "ROOM_FULL",
  "INVALID_OPERATION",
  "RATE_LIMITED",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

/** Canonical HTTP status per error code, per the approved ADR. */
export const ERROR_HTTP_STATUS: Record<ErrorCode, number> = {
  NICKNAME_EMPTY: 422,
  NICKNAME_INVALID: 422,
  SESSION_INVALID: 401,
  SESSION_ALREADY_IN_ROOM: 409,
  ROOM_NOT_FOUND: 404,
  ROOM_FULL: 409,
  INVALID_OPERATION: 400,
  RATE_LIMITED: 429,
};

/** Unified HTTP error envelope: { error: { code, message, requestId } }. */
export interface HttpErrorEnvelope {
  error: {
    code: ErrorCode;
    message: string;
    requestId: string;
  };
}

/** Unified WebSocket error envelope: { type: "error", data: { code, message } }. */
export interface WsErrorEnvelope {
  type: "error";
  data: {
    code: ErrorCode;
    message: string;
  };
}

// ---- serializers / parsers (pure, no business logic / state) ----

/** Serialize the unified HTTP error envelope to a JSON string. */
export function encodeHttpError(
  code: ErrorCode,
  message: string,
  requestId: string
): string {
  return JSON.stringify({ error: { code, message, requestId } });
}

/** Parse a JSON string back into the unified HTTP error envelope. */
export function decodeHttpError(payload: string): HttpErrorEnvelope {
  return JSON.parse(payload) as HttpErrorEnvelope;
}

/** Serialize the unified WebSocket error envelope to a JSON string. */
export function encodeWsError(code: ErrorCode, message: string): string {
  return JSON.stringify({ type: "error", data: { code, message } });
}

/** Parse a JSON string back into the unified WebSocket error envelope. */
export function decodeWsError(payload: string): WsErrorEnvelope {
  return JSON.parse(payload) as WsErrorEnvelope;
}

// ---- crypto-random requestId generation (TDD-01a) ----

/**
 * Generate a crypto-random requestId for a unified error envelope.
 * Backed by the Node global `crypto.randomUUID()` (RFC 4122 UUIDv4), which
 * uses a CSPRNG and therefore yields a fresh, unpredictable value per call.
 */
export function generateRequestId(): string {
  return crypto.randomUUID();
}
