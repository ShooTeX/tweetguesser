import { createTRPCRouter } from "./trpc";
import { exampleRouter } from "./routers/example";
import { twitterRouter } from "./routers/twitter";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  twitter: twitterRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
