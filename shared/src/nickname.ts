// LOB-05 nickname normalization/validation for Truco v0.1.
// Pure and transport-agnostic: no session/room state, no I/O. Trims
// surrounding whitespace and enforces the 1..20 (inclusive) character range,
// mapping violations to the canonical NICKNAME_EMPTY / NICKNAME_INVALID codes
// from the shared error contract. 20 characters is valid.

export interface ValidNickname {
  ok: true;
  value: string;
}

export interface InvalidNickname {
  ok: false;
  code: "NICKNAME_EMPTY" | "NICKNAME_INVALID";
}

export type NicknameResult = ValidNickname | InvalidNickname;

export function normalizeNickname(input: string): NicknameResult {
  const value = input.trim();
  if (value.length === 0) {
    return { ok: false, code: "NICKNAME_EMPTY" };
  }
  if (value.length > 20) {
    return { ok: false, code: "NICKNAME_INVALID" };
  }
  return { ok: true, value };
}
