import { api } from "~/trpc/server";

export default async function Home() {
  const transactionData = api.transaction.getTransactions();
  console.log("here", transactionData);

  return <h1>Hello</h1>;
}
