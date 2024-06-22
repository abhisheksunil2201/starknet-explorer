import { NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { db } from "~/server/db";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import axios from "axios";
import type { AxiosResponse } from "axios";
import { env } from "~/env";
import type { ITransactionsResponse } from "~/server/types";

interface ILatestBlockResponse extends AxiosResponse {
  result: number;
}

async function handler() {
  try {
    const { data: blockData, status: blockStatus } =
      await axios.post<ILatestBlockResponse>(
        env.API_URL,
        {
          jsonrpc: "2.0",
          method: "starknet_blockNumber",
          params: [],
          id: 1,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    if (blockStatus == 200) {
      const blockNumber: number = blockData.result;
      if (blockNumber !== undefined || blockNumber !== null) {
        const temp_block_number = blockNumber - 10;

        for (let i = temp_block_number; i <= blockNumber; i++) {
          try {
            const { data: transactionData, status: transactionStatus } =
              await axios.post<ITransactionsResponse>(
                env.API_URL,
                {
                  jsonrpc: "2.0",
                  method: "starknet_getBlockWithTxs",
                  params: [
                    {
                      block_number: i,
                    },
                  ],
                  id: 1,
                },
                {
                  headers: {
                    "Content-Type": "application/json",
                  },
                },
              );

            if (transactionStatus == 200) {
              for (const j of transactionData.result.transactions) {
                try {
                  await db.transaction.upsert({
                    where: {
                      hash: j.transaction_hash,
                    },
                    create: {
                      status: transactionData.result.status,
                      hash: j.transaction_hash,
                      type: j.type,
                      block: transactionData.result.block_number,
                      age: transactionData.result.timestamp,
                      max_fee: j.max_fee,
                      nonce: j.nonce,
                      sender_address: j.sender_address,
                      signature: j.signature,
                      version: j.version,
                      l1_gas_price:
                        transactionData.result.l1_gas_price.price_in_wei,
                      calldata: [],
                    },
                    update: {},
                  });
                } catch (err) {
                  console.log("Failed to fetch transaction data", err);
                }
              }
            } else {
              console.log("Failed to fetch transaction data");
            }
          } catch (err) {
            console.log(err);
          }
        }
      }
    }
  } catch (err) {
    console.log("Failed to fetch data", err);
  }
  console.log("Cron job executed");

  return NextResponse.json({ message: "Cron job completed" });
}

export const POST = verifySignatureAppRouter(handler);

// This is required for QStash verification
export const runtime = "nodejs";
