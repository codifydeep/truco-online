import { pathToFileURL } from "node:url";
import { buildApp } from "./app.js";

export interface ListenTarget {
  host: string;
  port: number;
}

/** Resolve the bind host/port from the environment with documented defaults. */
export function listenTarget(
  env: Record<string, string | undefined> = process.env,
): ListenTarget {
  return {
    host: env.HOST ?? "0.0.0.0",
    port: Number(env.PORT ?? 8080),
  };
}

/** Build the app and bind it to the env-specified host/port. */
export async function start(
  env: Record<string, string | undefined> = process.env,
) {
  const app = buildApp();
  const { host, port } = listenTarget(env);
  await app.listen({ host, port });
  return app;
}

// Bind only when this module is executed directly as the entrypoint.
const isEntry =
  process.argv[1] !== undefined &&
  pathToFileURL(process.argv[1]).href === import.meta.url;

if (isEntry) {
  await start();
}
