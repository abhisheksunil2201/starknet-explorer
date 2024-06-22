import axios from "axios";
import type { ITransactionHash, ITransactionReceipt } from "./server/types";

export const getTransactionReceipt = async ({
  id,
  setTransactionReceipt,
}: {
  id: string;
  setTransactionReceipt: React.Dispatch<
    React.SetStateAction<ITransactionReceipt["result"] | undefined>
  >;
}) => {
  try {
    const { data, status } = await axios.post<ITransactionReceipt>(
      "https://starknet-mainnet.blastapi.io/e39b721f-f93b-4219-8b91-e14fb019af9b",
      {
        jsonrpc: "2.0",
        method: "starknet_getTransactionReceipt",
        params: [id],
        id: 0,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (status === 200) setTransactionReceipt(data?.result);
  } catch (error) {
    console.log(error);
  }
};

export const getTransactionByHash = async ({
  id,
  setTransactionByHash,
}: {
  id: string;
  setTransactionByHash: React.Dispatch<
    React.SetStateAction<ITransactionHash | undefined>
  >;
}) => {
  try {
    const { data, status } = await axios.post<ITransactionHash>(
      "https://starknet-mainnet.blastapi.io/e39b721f-f93b-4219-8b91-e14fb019af9b",
      {
        jsonrpc: "2.0",
        method: "starknet_getTransactionByHash",
        params: [id],
        id: 0,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    console.log(data);

    if (status === 200) setTransactionByHash(data);
  } catch (error) {
    console.log(error);
  }
};
