// Immutable base schema version shared by the web transports (TDD-01
// increment). It is a single frozen truth for the wire/schema contract; server
// and consumers read it through re-export shims. No logic or state lives here.

export const SHARED_SCHEMA_VERSION = "1.0.0" as const;
