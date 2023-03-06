#!/usr/bin/env node

import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import fastify from "fastify";
import { appRouter } from "./router";
import { createContext } from "./trpc";

const server = fastify({
  maxParamLength: 5000,
  logger: process.env.NODE_ENV !== "production",
});

void server.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: { router: appRouter, createContext },
});

try {
  await server.listen({ port: 3000 });
  console.info("Server started");
} catch (error) {
  server.log.error(error);
  process.exit(1);
}
