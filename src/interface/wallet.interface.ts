export interface DepositResponse {
  wallet: {
    userId: string;
    balance: number;
    currency: string;
    status: string;
  };
}

export interface TransferResponse {
  transaction: {
    amount: number;
    status: string;
  };
}
