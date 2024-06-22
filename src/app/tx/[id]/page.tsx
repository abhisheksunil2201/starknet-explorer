"use client";
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import type { ITransactionHash, ITransactionReceipt } from "~/server/types";
import { useCopyToClipboard } from "@uidotdev/usehooks";
import { api } from "~/trpc/react";
import MaxWidthWrapper from "~/components/MaxWidthWrapper";
import Label from "~/components/Label";
import { CircleHelp, Copy } from "lucide-react";
import Badge from "~/components/Badge";
import {
  cn,
  convertAge,
  formatDate,
  formatTime,
  formatTimeStamp,
  toDecimal,
  weiToEther,
} from "~/lib/utils";
import StatusTimeline from "~/components/StatusTimeline";
import Row from "~/components/Row";
import { callDataTabs, tooltipStyle } from "~/consts";
import { getTransactionByHash, getTransactionReceipt } from "~/requests";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import axios from "axios";

const Transaction = () => {
  const params = useParams<{ id: string }>();
  const [transactionReceipt, setTransactionReceipt] =
    useState<ITransactionReceipt["result"]>();
  const [transactionByHash, setTransactionByHash] =
    useState<ITransactionHash>();
  const searchParams = useSearchParams();
  const [pageStatus, setPageStatus] = useState<boolean>(true);
  const [callDataTab, setCallDataTab] = useState<string>("Hex");
  const [eth, setEth] = useState<number>(0);
  const [, copyToClipboard] = useCopyToClipboard();

  const { id } = params;
  const age = searchParams.get("age");

  const handleCopy = async (value: string | number) => {
    await copyToClipboard(String(value));
  };

  const getTransactionByHashQuery =
    api.transaction.getTransactionByHash.useQuery({
      hash: id,
    });

  const getEthValue = async () => {
    const res = await axios.get<{
      ethereum: {
        usd: number;
      };
    }>(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
    );
    setEth(res.data.ethereum.usd);
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

  const transformCallData = (value: string) => {
    switch (callDataTab) {
      case "Hex":
        return value;
      case "Dec":
        if (value.startsWith("0x")) {
          value = value.slice(2);
        }
        return parseInt(value, 16);
      case "Text":
        value = value.startsWith("0x") ? value.slice(2) : value;
        if (value.length % 2 !== 0) {
          value = "0" + value;
        }
        let text = "";
        for (let i = 0; i < value.length; i += 2) {
          const charCode = parseInt(value.substr(i, 2), 16);
          text += String.fromCharCode(charCode);
        }
        return text;
      default:
        return value;
    }
  };

  useEffect(() => {
    getTransactionReceipt({ id, setTransactionReceipt }).catch((err) =>
      console.log(err),
    );
    getTransactionByHash({ id, setTransactionByHash }).catch((err) =>
      console.log(err),
    );
    getEthValue().catch((err) => console.log(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            <div className="rounded-xl bg-[#121212] px-2 py-1">
              {transactionReceipt?.events?.length ?? 0}
            </div>
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
                  ETH ($
                  {(
                    weiToEther(
                      toDecimal(transactionReceipt?.actual_fee.amount),
                    )! * eth
                  ).toFixed(6)}
                  )
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
                  <TooltipProvider>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger>
                        <Link href="" className="text-[#8BA3DF]">
                          {getTransactionByHashQuery.isFetched &&
                            getTransactionByHashQuery.data?.sender_address}
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent style={tooltipStyle}>
                        <p>
                          {getTransactionByHashQuery.isFetched &&
                            getTransactionByHashQuery.data?.sender_address}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </p>
                <Copy
                  cursor={"pointer"}
                  width={15}
                  height={15}
                  className="ml-2"
                  onClick={() =>
                    handleCopy(
                      getTransactionByHashQuery.data?.sender_address ?? "",
                    )
                  }
                />
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
              {/* calldata */}
              <div className="mb-8 flex h-fit max-h-fit flex-row py-2">
                <div className="flex w-[250px] flex-row  space-x-2">
                  <CircleHelp width={17} height={17} />
                  <span className="text-xs uppercase">CALLDATA:</span>
                </div>

                <div className="h-[431px] w-full bg-[#252525] p-4">
                  <div className="flex">
                    <div className="mb-8 flex overflow-auto">
                      {callDataTabs.map((tab, index) => (
                        <button
                          key={tab}
                          className={cn([
                            "inline-flex h-9 items-center justify-center whitespace-nowrap border border-r-0 border-[#4B4B4B] bg-[#1b1b1b] px-4 py-2 text-sm font-medium text-white ring-offset-background transition-colors hover:bg-[#555555] focus-visible:outline-none  focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                            index === callDataTabs.length - 1 && "border-r-1",
                            callDataTab === tab && "bg-[#4B4B4B]",
                          ])}
                          onClick={() => setCallDataTab(tab)}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                    <div className="mb-8 ml-8 flex overflow-auto">
                      {["Decoded", "Raw"].map((tab, index) => (
                        <button
                          key={tab}
                          className={cn([
                            "inline-flex h-9 items-center justify-center whitespace-nowrap border border-r-0 border-[#4B4B4B] bg-[#1b1b1b] px-4 py-2 text-sm font-medium text-white ring-offset-background transition-colors hover:bg-[#383838] hover:bg-primary/90 focus-visible:outline-none  focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                            index === 1 && "border-r-1",
                            "Raw" === tab && "bg-[#4B4B4B]",
                          ])}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="no-scrollbar h-[329px] w-full overflow-x-auto overflow-y-auto border-[#383838] bg-[#1b1b1b]">
                      <Table>
                        <TableHeader>
                          <TableRow className="h-2.5 border-[#4B4B4B] hover:bg-white/25">
                            <TableHead className="text-xs uppercase text-[#AAAAAA]">
                              input
                            </TableHead>
                            <TableHead className="text-xs uppercase text-[#AAAAAA]">
                              value
                            </TableHead>
                            <TableHead className="text-xs uppercase text-[#AAAAAA]">
                              {""}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactionByHash?.result.calldata.map(
                            (data, index) => (
                              <TableRow
                                key={index}
                                className="h-2.5 border-[#4B4B4B] hover:bg-white/25"
                              >
                                <TableCell align="left" width={100}>
                                  <p className="text-[14px] text-[#f5ab35]">
                                    {index}
                                  </p>
                                </TableCell>
                                <TableCell align="left" width={650}>
                                  <p className="text-[#82F4BB]">
                                    {`"${transformCallData(data)}"`}
                                  </p>
                                </TableCell>
                                <TableCell align="left">
                                  <Copy
                                    cursor={"pointer"}
                                    width={15}
                                    height={15}
                                    onClick={() =>
                                      handleCopy(transformCallData(data))
                                    }
                                  />
                                </TableCell>
                              </TableRow>
                            ),
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </div>
              <Row label="SIGNATURE(S)">
                <div className="flex w-full flex-col">
                  {getTransactionByHashQuery.data?.signature?.map(
                    (signature) => (
                      <div key={signature}>
                        <div className="flex flex-row items-center justify-between border-t-[1px] border-[#383838] py-2">
                          <p className="text-[14px] text-[#f5ab35]">
                            {signature}
                          </p>
                          <Copy
                            cursor={"pointer"}
                            width={15}
                            height={15}
                            className="mr-4"
                            color="gray"
                            onClick={() => handleCopy(signature ?? "")}
                          />
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </Row>
              &nbsp;
            </div>
          </>
        ) : (
          <>
            <div className="h-fit w-full">
              <Table>
                <TableHeader>
                  <TableRow className="h-2.5 border-[#4B4B4B] hover:bg-white/25">
                    <TableHead className="text-xs uppercase text-[#AAAAAA]">
                      id
                    </TableHead>
                    <TableHead className="text-xs uppercase text-[#AAAAAA]">
                      block
                    </TableHead>
                    <TableHead className="text-xs uppercase text-[#AAAAAA]">
                      age
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionReceipt?.events?.map((_, index) => (
                    <TableRow
                      key={index}
                      className="h-2.5 border-[#4B4B4B] hover:bg-white/25"
                    >
                      <TableCell align="left">
                        {/* blockNo_txnIndex_eventIndex */}
                        <TooltipProvider>
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger>
                              <Link href="" className="text-[#8BA3DF]">
                                {`${transactionReceipt?.block_number}_${getTransactionByHashQuery?.data?.id}_${index}`}
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent style={tooltipStyle}>
                              <p>{`${transactionReceipt?.block_number}_${getTransactionByHashQuery?.data?.id}_${index}`}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell
                        align="left"
                        className="flex items-center gap-2"
                      >
                        <Link href="" className="text-[#8BA3DF]">
                          {transactionReceipt?.block_number}
                        </Link>
                        <Copy
                          cursor={"pointer"}
                          width={15}
                          height={15}
                          color="gray"
                          onClick={() =>
                            handleCopy(transactionReceipt?.block_number ?? "")
                          }
                        />
                      </TableCell>
                      <TableCell align="left">
                        <TooltipProvider>
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger>
                              <p>{convertAge(Number(age!))}</p>
                            </TooltipTrigger>
                            <TooltipContent style={tooltipStyle}>
                              <p>{formatTimeStamp(Number(age))}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </MaxWidthWrapper>
  );
};

export default Transaction;
