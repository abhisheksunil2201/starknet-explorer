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

  CustomPaginateTransactions: publicProcedure
    .input(z.object({ skip: z.number(), take: z.number().optional() }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.transaction.findMany({
        orderBy: [
          {
            age: "desc",
          },
        ],
        skip: input.skip,
        take: input.take,
      });
    }),

  getTransactionByHash: publicProcedure
    .input(
      z.object({
        Tx_hash: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (input.Tx_hash !== undefined) {
        const TxData = await ctx.db.transaction.findUnique({
          where: {
            hash: input.Tx_hash,
          },
        });

        return TxData;
      }
    }),
});
