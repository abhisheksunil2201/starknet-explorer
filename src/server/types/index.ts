import type { AxiosResponse } from "axios";

export interface ITransactionsResponse extends AxiosResponse {
  result: {
    block_number: number;
    timestamp: number;
    status: string;
    transactions: [
      {
        max_fee: string;
        sender_address: string;
        nonce: string;
        version: string;
        transaction_hash: string;
        type: string;
        signature: [];
      },
    ];
    l1_gas_price: {
      price_in_wei: string;
    };
  };
}

export interface ITransactionReceipt {
  result: {
    type: string;
    transaction_hash: string;
    actual_fee: {
      amount: string;
      unit: string;
    };
    block_number: number;
    execution_resources: {
      steps: number;
      pedersen_builtin_applications: number;
      ec_op_builtin_applications: number;
      range_check_builtin_applications: number;
    };
  };
}
