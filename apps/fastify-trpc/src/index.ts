#!/usr/bin/env node

import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import fastify from "fastify";
import { appRouter } from "./router";
import { createContext } from "./trpc";
import ws from "@fastify/websocket";
import getPort from "get-port";
import { PORT } from "./environment";

const server = fastify({
  maxParamLength: 5000,
  logger: process.env.NODE_ENV !== "production",
});

void server.register(ws);

void server.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: { router: appRouter, createContext },
  useWSS: true,
});

try {
  await server.listen({
    port: await getPort({ port: [PORT, 3000, 3001, 3002] }),
  });
  console.info("Server started");
} catch (error) {
  server.log.error(error);
  process.exit(1);
}
