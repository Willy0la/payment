import { WalletModel } from 'src/wallet/wallet.schema';
import {
  TransferResponse,
  DepositResponse,
} from 'src/interface/wallet.interface';

export function depositSanitizer(wallet: WalletModel): DepositResponse {
  return {
    wallet: {
      userId: wallet.userId.toString(),
      balance: wallet.balance,
      currency: wallet.currency,
      status: 'SUCCESS',
    },
  };
}

export function transferSanitizer(amount: number): TransferResponse {
  return {
    transaction: {
      amount,
      status: 'SUCCESS',
    },
  };
}
