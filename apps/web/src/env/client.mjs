// @ts-check
import { clientEnv as clientEnvironment, clientSchema } from "./schema.mjs";

const _clientEnvironment = clientSchema.safeParse(clientEnvironment);

export const formatErrors = (
  /** @type {import('zod').ZodFormattedError<Map<string,string>,string>} */
  errors
) =>
  Object.entries(errors)
    .map(([name, value]) => {
      if (value && "_errors" in value)
        return `${name}: ${value._errors.join(", ")}\n`;
    })
    .filter(Boolean);

if (!_clientEnvironment.success) {
  console.error(
    "❌ Invalid environment variables:\n",
    ...formatErrors(_clientEnvironment.error.format())
  );
  throw new Error("Invalid environment variables");
}

for (let key of Object.keys(_clientEnvironment.data)) {
  if (!key.startsWith("NEXT_PUBLIC_")) {
    console.warn(
      `❌ Invalid public environment variable name: ${key}. It must begin with 'NEXT_PUBLIC_'`
    );

    throw new Error("Invalid public environment variable name");
  }
}

// eslint-disable-next-line unicorn/prevent-abbreviations
export const env = _clientEnvironment.data;
