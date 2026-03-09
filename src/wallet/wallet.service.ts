import { Injectable } from '@nestjs/common';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { BaseService } from 'src/base/base.service';
import { DepositDto, SendMoneyDto } from './wallet.dto';
import { v4 as uuidv4 } from 'uuid';
import {
  depositSanitizer,
  transferSanitizer,
} from '../sanitizers/wallet.sanitizer';
import {
  TransferResponse,
  DepositResponse,
} from 'src/interface/wallet.interface';
import { AppErrors } from 'src/common/error';
import {
  TransactionStatus,
  TransactionType,
} from 'src/transaction/transaction.enum';
import mongoose from 'mongoose';
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
    const { receiverAccountNumber, amount, reference, idempotencyKey } = dto;

    if (idempotencyKey) {
      const existingKey =
        await this.baseService.findIdempotencyKey(idempotencyKey);
      if (existingKey) {
        if (
          (existingKey.status as unknown as TransactionStatus) ===
          TransactionStatus.success
        ) {
          return existingKey.previousResponse as TransferResponse;
        }
        throw AppErrors.BAD_REQUEST(
          `Duplicate request with status: ${existingKey.status}`,
        );
      }
    }

    const session = await this.connection.startSession();
    const transactionID = `TXN-${uuidv4().slice(0, 8).toUpperCase()}`;

    try {
      await session.withTransaction(async () => {
        const receiverUser = await this.baseService.findUserByAccountNumber(
          receiverAccountNumber,
          session,
        );

        if (!receiverUser) {
          throw AppErrors.NOT_FOUND('Receiver not found');
        }

        if (receiverUser._id.toString() === userId)
          throw AppErrors.BAD_REQUEST('Cannot transfer to yourself');

        const senderUpdated = await this.baseService.decrementWalletBalance(
          userId,
          amount,
          session,
        );

        if (!senderUpdated) {
          throw AppErrors.BAD_REQUEST('Insufficient balance');
        }

        await this.baseService.incrementWalletBalance(
          receiverUser._id.toString(),
          amount,
          session,
        );
        await this.baseService.createTransaction(
          {
            sender: new mongoose.Types.ObjectId(userId),
            receiver: receiverUser._id,
            amount,
            transactionID,
            reference,
            transactionType: TransactionType.transfer,
            transactionStatus: TransactionStatus.success,
          },
          session,
        );

        if (idempotencyKey) {
          await this.baseService.createIdempotencyKey(
            {
              key: idempotencyKey,
              transactionID,
              status: TransactionStatus.success,
              previousResponse: transferSanitizer(amount),
            },
            session,
          );
        }
      });

      // RETURN OUTSIDE TRANSACTION
      return transferSanitizer(amount);
    } finally {
      await session.endSession();
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
