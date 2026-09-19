// Shared error envelope per the approved ADR error contract, consumed by both
// the HTTP and WebSocket transports. A pure serializer: no sessions/rooms
// logic, no I/O, no HTTP/WS coupling lives here.

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

export interface ErrorEnvelope {
  error: {
    code: ErrorCode;
    message: string;
    requestId: string;
  };
}

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

export function errorEnvelope(
  code: ErrorCode,
  requestId: string,
  message?: string
): ErrorEnvelope {
  return {
    error: {
      code,
      message: message ?? DEFAULT_MESSAGES[code],
      requestId,
    },
  };
}
