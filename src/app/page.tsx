"use client";

import type { Transaction } from "@prisma/client";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import TransactionTable from "~/components/TransactionTable";
import MaxWidthWrapper from "~/components/MaxWidthWrapper";

export default function Home() {
  const [items, setItems] = useState(0);
  const [txData, setTxData] = useState<Transaction[] | undefined>([]);
  const [filterState, setFilterState] = useState<string>("ALL");

  const TxPagination = api.transaction.paginateTransactions.useMutation({
    onSuccess: (res) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      setTxData((prevData) => [...(prevData ?? []), ...res]);
    },
  });

  const fetchPaginatedTransactions = async () => {
    console.log(items);

    TxPagination.mutate({ skip: items + 25 });
    setItems((items) => items + 25);
  };

  const fetchTransactions = async () => {
    TxPagination.mutate({ skip: items });
  };

  useEffect(() => {
    fetchTransactions().catch((err) => {
      console.log(err);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <MaxWidthWrapper className="mb-12 mt-28 flex flex-col items-center justify-center text-center sm:mt-40">
        <TransactionTable
          data={txData}
          filterState={filterState}
          setFilterState={setFilterState}
          fetchTransactions={fetchPaginatedTransactions}
        />
      </MaxWidthWrapper>
    </>
  );
}
