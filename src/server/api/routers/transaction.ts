import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const transactionRouter = createTRPCRouter({
  getTransactions: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.transaction.findMany();
  }),

  paginateTransactions: publicProcedure
    .input(z.object({ skip: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.transaction.findMany({
        orderBy: [
          {
            age: "desc",
          },
        ],
        skip: input.skip,
        take: 25,
      });
    }),

  getTransactionByHash: publicProcedure
    .input(
      z.object({
        hash: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (input.hash !== undefined) {
        const data = await ctx.db.transaction.findUnique({
          where: {
            hash: input.hash,
          },
        });

        return data;
      }
    }),
});
