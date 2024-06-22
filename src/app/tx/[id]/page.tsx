"use client";
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import type {
  ITransactionReceipt,
  ITransactionsResponse,
} from "~/server/types";
import { useCopyToClipboard } from "@uidotdev/usehooks";
import { api } from "~/trpc/react";
import { env } from "~/env";
import axios from "axios";
import MaxWidthWrapper from "~/components/MaxWidthWrapper";
import Label from "~/components/Label";
import { CircleHelp, Copy } from "lucide-react";
import Badge from "~/components/Badge";
import {
  convertAge,
  formatDate,
  formatTime,
  formatTimeStamp,
  toDecimal,
  weiToEther,
} from "~/lib/utils";
import StatusTimeline from "~/components/StatusTimeline";
import Row from "~/components/Row";

const Transaction = () => {
  const params = useParams<{ id: string }>();
  const [transactionReceipt, setTransactionReceipt] =
    useState<ITransactionReceipt["result"]>();
  const searchParams = useSearchParams();
  const [pageStatus, setPageStatus] = useState<boolean>(true);
  const [clipboardText, copyToClipboard] = useCopyToClipboard();

  const { id } = params;
  const age = searchParams.get("age");

  const handleCopy = async (value: string | number) => {
    await copyToClipboard(String(value));
  };

  const getTransactionByHashQuery =
    api.transaction.getTransactionByHash.useQuery({
      hash: id,
    });

  const getTransactionReceipt = async () => {
    try {
      const { data, status } = await axios.post<ITransactionReceipt>(
        "https://starknet-mainnet.blastapi.io/e39b721f-f93b-4219-8b91-e14fb019af9b",
        {
          jsonrpc: "2.0",
          method: "starknet_getTransactionReceipt",
          params: [id],
          id: 1,
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

  const calculate_gas = () => {
    if (transactionReceipt && getTransactionByHashQuery.isFetched) {
      if (
        getTransactionByHashQuery.data !== undefined &&
        getTransactionByHashQuery.data !== null
      ) {
        const a = weiToEther(toDecimal(transactionReceipt?.actual_fee.amount));
        const b =
          getTransactionByHashQuery.data.l1_gas_price !== undefined
            ? weiToEther(toDecimal(getTransactionByHashQuery.data.l1_gas_price))
            : undefined;

        if (a !== undefined && b !== undefined) {
          return a / b;
        }
      }
    }
  };

  // const handleCallData = (type: string) => {
  //   switch (type) {
  //     case 'hex':
  //       return
  //     case 'dec':
  //       return
  //     default:
  //       return '
  //   }
  // }

  useEffect(() => {
    getTransactionReceipt().catch((err) => console.log(err));
  }, []);

  return (
    <MaxWidthWrapper className="mb-12 mt-28 flex flex-col items-center justify-center text-center sm:mt-40">
      <div className="flex w-full flex-col items-start bg-[#1B1B1B] p-12">
        <p className="mb-12  text-xl">Transaction</p>
        <Label label="hash" className="mb-7">
          <div className="flex flex-row items-center space-x-2">
            <p>{id}</p>
            <Copy
              width={15}
              height={15}
              cursor={"pointer"}
              className="ml-2"
              color="gray"
              onClick={() => handleCopy(id)}
            />
          </div>
        </Label>
        <div className="mb-8 flex h-fit w-fit flex-row ">
          <Label
            label="TYPE"
            className="mr-40 flex flex-col justify-start"
            twStyle="mb-1"
          >
            <Badge
              label="INVOKE"
              style={{
                backgroundColor: "#202E26",
                color: "#82F4BB",
                borderColor: "#2E4C3C",
              }}
            />
          </Label>
          <Label label="timestamp" className="flex flex-col" twStyle="mb-1">
            <p className="text-md flex flex-row items-center">
              {formatDate(age!)} &nbsp;{" "}
              <span className="text-xs font-thin">{formatTime(age!)}</span>{" "}
            </p>
          </Label>
        </div>
        <div>
          <Label label="STATUS" className="mb-9 flex flex-col">
            <StatusTimeline />
          </Label>
        </div>
        <div className="mb-8 flex space-x-10">
          <button
            onClick={() => setPageStatus(true)}
            className={`pb-4 text-sm  text-[#CACACA] hover:border-b-2 hover:border-[#a35d42] ${pageStatus == true && "border-b-2 border-[#BF6D4C]"}`}
          >
            Overview
          </button>

          <button
            onClick={() => setPageStatus(false)}
            className={`flex flex-row  items-center space-x-2 pb-4 text-sm text-[#CACACA] hover:border-b-2 hover:border-[#a35d42] active:border-[#BF6D4C] ${pageStatus == false && "border-b-2 border-[#BF6D4C]"} `}
          >
            <p className="font-medium text-[#AAAAAA]"> Events</p>
            <div className="rounded-xl bg-[#121212] px-2 py-1">0</div>
          </button>
        </div>
        {pageStatus == true ? (
          <>
            <div className="flex h-fit w-full flex-col">
              <h1 className="mb-6  self-start text-xl">Transaction Details</h1>
              <Row label="block number">
                <p className="text-[14px]">
                  {transactionReceipt?.block_number}
                </p>
              </Row>
              <Row label="timestamp">
                <p className="text-[14px]">
                  {convertAge(Number(age!))} ({" "}
                  {formatTimeStamp(Number(age!), false)} )
                </p>
              </Row>
              <Row label="actual fee">
                <p className="text-[14px]">
                  {weiToEther(toDecimal(transactionReceipt?.actual_fee.amount))}{" "}
                  ETH
                </p>
              </Row>
              <Row label="max fee">
                <p className="text-[14px]">
                  {getTransactionByHashQuery.isFetched &&
                    weiToEther(
                      toDecimal(getTransactionByHashQuery.data?.max_fee),
                    )}{" "}
                  ETH
                </p>
              </Row>
              <Row label="gas consumed">
                <p className="text-[14px]">
                  {Math.floor(calculate_gas() ?? 0)}
                </p>
              </Row>
              <Row label="sender address">
                <p className="text-[14px]">
                  {getTransactionByHashQuery.isFetched &&
                    getTransactionByHashQuery.data?.sender_address}
                </p>
              </Row>
            </div>

            <div className="mt-8 flex h-fit w-full flex-col">
              <h1 className="mb-6  self-start text-xl">Developer Info</h1>
              <Row label="unix timestamp">
                <p className="text-[14px]">
                  {getTransactionByHashQuery.data?.age}
                </p>
              </Row>
              <Row label="nonce">
                <p className="text-[14px]">
                  {toDecimal(getTransactionByHashQuery.data?.nonce)}
                </p>
              </Row>
              <Row label="position">
                <p className="text-[14px]">
                  {getTransactionByHashQuery?.data?.id}
                </p>
              </Row>
              <Row label="version">
                <p className="text-[14px]">
                  {getTransactionByHashQuery !== null &&
                    getTransactionByHashQuery !== undefined &&
                    toDecimal(getTransactionByHashQuery.data?.version)}
                </p>
              </Row>
              {/* Execution Resources*/}
              <div className="flex h-fit max-h-fit flex-row py-2">
                <div className="flex w-[250px] flex-row space-x-2">
                  <CircleHelp width={17} height={17} />
                  <span className="text-xs uppercase">execution resources</span>
                </div>
                <div className="flex h-full w-full flex-row items-center border-b-[1px] border-[#383838]  pb-2">
                  <div className="flex h-fit w-fit flex-col items-start justify-center space-y-1">
                    <div>
                      <Badge
                        label={`${transactionReceipt?.execution_resources.steps} STEPS`}
                        style={{
                          backgroundColor: "#202E26",
                          color: "#82F4BB",
                          borderColor: "#2E4C3C",
                        }}
                      />
                    </div>

                    <div className="flex flex-row space-x-2">
                      <Badge
                        label={`${transactionReceipt?.execution_resources.pedersen_builtin_applications} PEDERSEN_BUILTIN`}
                        style={{
                          backgroundColor: "#3b2a1c",
                          color: "#ffc899",
                          borderColor: "#583f2a",
                        }}
                      />
                      <Badge
                        label={`${transactionReceipt?.execution_resources.range_check_builtin_applications} RANGE_CHECK_BUILTIN`}
                        style={{
                          backgroundColor: "#3b2a1c",
                          color: "#ffc899",
                          borderColor: "#583f2a",
                        }}
                      />
                      <Badge
                        label={`${transactionReceipt?.execution_resources.ec_op_builtin_applications} EC_OP_BUILTIN`}
                        style={{
                          backgroundColor: "#3b2a1c",
                          color: "#ffc899",
                          borderColor: "#583f2a",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* CallData */}
              <div className="mb-8 flex h-fit max-h-fit flex-row py-2">
                <div className="flex w-[250px] flex-row  space-x-2">
                  <CircleHelp width={17} height={17} />
                  <span className="text-xs uppercase">CALLDATA:</span>
                </div>

                <div className="h-[431px] w-full bg-[#252525] p-4">
                  <div className="mb-8 flex overflow-auto">
                    <button className="inline-flex h-9 items-center justify-center whitespace-nowrap border border-r-0 border-[#4B4B4B] bg-[#1b1b1b] px-4 py-2 text-sm font-medium text-white ring-offset-background transition-colors hover:bg-[#383838] hover:bg-primary/90 focus-visible:outline-none  focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                      Hex
                    </button>
                  </div>

                  <div>
                    <div className="h-[329px] overflow-x-auto overflow-y-auto border-[#383838] bg-[#1b1b1b]">
                      <table className="table ">
                        {/* head */}
                        <thead className="">
                          <tr className="border-[#383838]">
                            <th className="py-7 font-medium">INPUT</th>
                            <th className="py-7 font-medium">VALUE</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* row 1 */}
                          <tr className="hover border-[#383838]">
                            <th className="py-7">1</th>
                            <td>Cy Ganderton</td>
                            <td>copy</td>
                          </tr>
                          {/* row 2 */}
                          <tr className="hover border-[#383838]">
                            <th className="py-7 ">2</th>
                            <td>Hart Hagerty</td>
                            <td>copy</td>
                          </tr>
                          {/* row 3 */}
                          <tr className="hover border-[#383838]">
                            <th className="py-7 ">3</th>
                            <td>Brice Swyre</td>
                            <td>copy</td>
                          </tr>
                          {/* row 4 */}
                          <tr className="hover border-[#383838]">
                            <th className="py-7 ">3</th>
                            <td>Brice Swyre</td>
                            <td>copy</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <Row label="SIGNATURE(S)">
                {getTransactionByHashQuery.data?.signature?.map((signature) => (
                  <div key={signature} className="h-full w-full">
                    <div className="flex h-full w-full flex-row items-center border-t-[1px]  border-[#383838]">
                      <p className="text-[14px] text-[#f5ab35]">{signature}</p>
                    </div>
                  </div>
                ))}
              </Row>
              &nbsp;
            </div>
          </>
        ) : (
          <>
            <div className="h-fit w-full">
              <table className="w-full caption-bottom text-sm">
                <thead className=" border border-x-0 border-[#4B4B4B]">
                  <tr className="text-xs text-[#AAAAAA]">
                    <th className="h-10 px-4 text-left align-middle font-medium  text-muted-foreground">
                      ID
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium  text-muted-foreground">
                      BLOCK
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium  text-muted-foreground">
                      AGE
                    </th>
                  </tr>
                </thead>
                <tbody className="text-xs ">
                  <tr className="border border-x-0 border-[#4B4B4B]">
                    <td className="h-10 px-4  align-middle ">
                      <span className="text-white">
                        {getTransactionByHashQuery.data?.id}
                      </span>
                    </td>
                    <td className="h-10 px-4 align-middle ">
                      <span className="text-white">
                        {transactionReceipt?.block_number ?? "loading ..."}
                      </span>
                    </td>
                    <td className="h-10 px-4 align-middle ">
                      <span className="text-white">bgyhjgui</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </MaxWidthWrapper>
  );
};

export default Transaction;
