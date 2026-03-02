import { Injectable } from '@nestjs/common';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { BaseService } from 'src/base/base.service';
import { DepositDto, SendMoneyDto } from './wallet.dto';

import {
  depositSanitizer,
  transferSanitizer,
} from '../sanitizers/wallet.sanitizer';
import {
  TransferResponse,
  DepositResponse,
} from 'src/interface/wallet.interface';

@Injectable()
export class WalletService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly baseService: BaseService,
  ) {}

  //still under refactoring and clean ups..

  async sendMoney(
    userId: string,
    dto: SendMoneyDto,
  ): Promise<TransferResponse> {
    const { receiverAccountNumber, amount } = dto;

    const session = await this.connection.startSession();

    try {
      await session.withTransaction(async () => {
        const receiverUser = await this.baseService.findUserByAccountNumber(
          receiverAccountNumber,
          session,
        );

        if (!receiverUser) {
          throw new Error('Receiver not found');
        }

        if (receiverUser._id.toString() === userId) {
          throw new Error('Cannot transfer to yourself');
        }

        const senderUpdated = await this.baseService.decrementWalletBalance(
          userId,
          amount,
          session,
        );

        if (!senderUpdated) {
          throw new Error('Insufficient balance');
        }

        await this.baseService.incrementWalletBalance(
          receiverUser._id.toString(),
          amount,
          session,
        );
      });

      // RETURN OUTSIDE TRANSACTION
      return transferSanitizer(amount);
    } finally {
      session.endSession();
    }
  }

  async deposit(userId: string, dto: DepositDto): Promise<DepositResponse> {
    const { amount } = dto;

    const updatedWallet = await this.baseService.incrementWalletBalance(
      userId,
      amount,
    );

    if (!updatedWallet) {
      throw new Error('Wallet not found');
    }

    return depositSanitizer(updatedWallet);
  }
}
