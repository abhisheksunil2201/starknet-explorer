import { transactionRouter } from "~/server/api/routers/transaction";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { Client } from "@upstash/qstash";
import { env } from "~/env";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  transaction: transactionRouter,
});

const qstashClient = new Client({
  token: env.QSTASH_TOKEN,
});

await qstashClient.schedules.create({
  destination: env.CRON_URL,
  cron: "0 * * * *",
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);