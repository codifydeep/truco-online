// Server-facing error contract for the unified error envelope (TDD-01a).
// The canonical code register (ERROR_CODES / ErrorCode) is owned by the shared
// module and re-exported here so server and shared can never drift: a single
// authoritative register. This file only adds the transport-side canonical
// default messages and the errorEnvelope helper; no sessions/rooms logic, no
// I/O, no HTTP/WS coupling lives here.

import { ERROR_CODES, type ErrorCode } from "../shared/src/errors.js";

export { ERROR_CODES, type ErrorCode };

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
