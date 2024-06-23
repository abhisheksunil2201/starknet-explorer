"use client";

import type { Transaction } from "@prisma/client";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { convertAge, formatTimeStamp, shortenHash } from "~/lib/utils";
import { Copy } from "lucide-react";
import { useCopyToClipboard } from "@uidotdev/usehooks";
import Badge from "./Badge";
import Link from "next/link";
import Filter from "./Filter";
import { tableColumns, tooltipStyle } from "~/consts";
import dynamic from "next/dynamic";

interface TransactionTableProps {
  data: Transaction[] | undefined;
  filterState: string;
  setFilterState: Dispatch<SetStateAction<string>>;
  fetchTransactions: () => void;
}

const TransactionTable = ({
  data,
  filterState,
  setFilterState,
  fetchTransactions,
}: TransactionTableProps) => {
  const [clipboardText, copyToClipboard] = useCopyToClipboard();
  const [showBadge, setShowBadge] = useState(false);
  const observerTarget = useRef(null);

  const handleFilter = useCallback(
    (filter: string) => {
      return filter.toLowerCase().includes("all")
        ? data
        : data?.filter((transaction) =>
            transaction.type.toLowerCase().includes(filter.toLowerCase()),
          );
    },
    [data],
  );

  const filteredData = useMemo(
    () => handleFilter(filterState),
    [handleFilter, filterState],
  );

  const transactionType = (type: string) => {
    const styles: CSSProperties = {};
    switch (type) {
      case "DECLARE":
        styles.backgroundColor = "#202e26";
        styles.color = "#feffb5";
        styles.borderColor = "#6b7d07";
        break;
      case "DEPLOY":
        styles.backgroundColor = "#223655";
        styles.color = "#d2e5ff";
        styles.borderColor = "#3c3c6e";
        break;
      case "DEPLOY_ACCOUNT":
        styles.backgroundColor = "#223655";
        styles.color = "#d2e5ff";
        styles.borderColor = "#3c3c6e";
        break;
      case "INVOKE":
        styles.backgroundColor = "#202E26";
        styles.color = "#82F4BB";
        styles.borderColor = "#2E4C3C";
        break;
      case "L1_HANDLER":
        styles.backgroundColor = "#383838";
        styles.color = "#ffffff";
        styles.borderColor = "#5e5e5e";
        break;
      default:
        return null;
    }
    return <Badge label={type} style={styles} />;
  };

  const handleCopy = async (value: string | number) => {
    await copyToClipboard(String(value));

    setShowBadge(true);
    setTimeout(() => {
      setShowBadge(false);
    }, 1000);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchTransactions();
        }
      },
      { threshold: 1 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(observerTarget.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [observerTarget]);

  return (
    <div className="w-full bg-[#1B1B1B] p-12">
      <div className="flex flex-col items-start">
        <p className="mb-2 text-2xl">Transactions</p>
        <p className="mb-6 text-sm text-[#CACACA]">
          A list of transactions on Starknet
        </p>
        <Filter filterState={filterState} setFilterState={setFilterState} />
      </div>
      <Table className="h-screen">
        <TableHeader>
          <TableRow className="h-2.5 border-[#4B4B4B] hover:bg-white/25">
            {tableColumns.map((col) => (
              <TableHead key={col} className="text-xs uppercase text-[#AAAAAA]">
                {col}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData?.length === 0 && (
            <TableRow className="hover:bg-transarent h-2.5 border-[#4B4B4B]">
              <TableCell align="center" colSpan={tableColumns.length}>
                <p className="text-sm text-[#AAAAAA]">No transactions found</p>
              </TableCell>
            </TableRow>
          )}
          {filteredData && filteredData?.length !== 0
            ? filteredData.map((tx) => (
                <TableRow
                  key={tx.hash}
                  className="h-2.5 border-[#4B4B4B] hover:bg-white/25"
                >
                  <TableCell align="left" width={100}>
                    <TooltipProvider>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger>
                          <div>
                            <Image
                              src="/icons/status.svg"
                              alt={tx.status}
                              width={25}
                              height={25}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent style={tooltipStyle}>
                          <p>{tx.status}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell
                    align="left"
                    className="relative flex items-center"
                  >
                    <TooltipProvider>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger>
                          <Link
                            href={
                              tx.type === "INVOKE" && tx.version === "0x1"
                                ? `/tx/${tx.hash}?age=${tx.age}`
                                : ""
                            }
                            className="flex w-24 text-[#8BA3DF]"
                          >
                            {shortenHash(tx.hash)}
                          </Link>
                        </TooltipTrigger>
                        <Copy
                          width={13}
                          height={13}
                          cursor={"pointer"}
                          className="ml-2"
                          color="gray"
                          onClick={() => handleCopy(tx.hash)}
                        />
                        {showBadge && clipboardText === tx.hash && (
                          <Badge
                            label="COPIED!"
                            style={{
                              border: "none",
                              backgroundColor: "rgba(0,0,0,0.4)",
                              position: "absolute",
                              left: "9rem",
                            }}
                          />
                        )}
                        <TooltipContent style={tooltipStyle}>
                          <p>{tx.hash}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell align="left">{transactionType(tx.type)}</TableCell>
                  <TableCell align="left" className="flex items-center">
                    <Link href="" className="text-[#8BA3DF]">
                      {tx.block}
                    </Link>
                    <Copy
                      width={13}
                      height={13}
                      cursor={"pointer"}
                      className="ml-2"
                      color="gray"
                      onClick={() => handleCopy(tx.block)}
                    />
                  </TableCell>
                  <TableCell align="left">
                    <TooltipProvider>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger>{convertAge(tx.age)}</TooltipTrigger>
                        <TooltipContent style={tooltipStyle}>
                          <p>{formatTimeStamp(tx.age)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))
            : null}
        </TableBody>
      </Table>
      <div ref={observerTarget}></div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(TransactionTable), {
  ssr: false,
});
