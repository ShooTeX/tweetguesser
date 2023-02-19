// @ts-check
/**
 * This file is included in `/next.config.mjs` which ensures the app isn't built with invalid env vars.
 * It has to be a `.mjs`-file to be imported there.
 */
import { serverSchema, serverEnv as serverEnvironment } from "./schema.mjs";
import { env as clientEnvironment, formatErrors } from "./client.mjs";

const _serverEnvironment = serverSchema.safeParse(serverEnvironment);

if (!_serverEnvironment.success) {
  console.error(
    "❌ Invalid environment variables:\n",
    ...formatErrors(_serverEnvironment.error.format())
  );
  throw new Error("Invalid environment variables");
}

for (let key of Object.keys(_serverEnvironment.data)) {
  if (key.startsWith("NEXT_PUBLIC_")) {
    console.warn("❌ You are exposing a server-side env-variable:", key);

    throw new Error("You are exposing a server-side env-variable");
  }
}

// eslint-disable-next-line unicorn/prevent-abbreviations
export const env = { ..._serverEnvironment.data, ...clientEnvironment };
