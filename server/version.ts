// Server-source re-export of the immutable base schema version (TDD-01).
// shared/src is included in the build (tsconfig.build.json rootDir "."), so
// this shim re-exports the frozen value through the server source and is
// itself emitted by `tsc -p tsconfig.build.json`, proving the shared->server
// compile wiring. No logic or state lives here.
export { SHARED_SCHEMA_VERSION } from "../shared/src/version.js";
