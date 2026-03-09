import { Module } from '@nestjs/common';
import { UserModel, UserSchema } from '../user/user.schema';
import { WalletModel, WalletSchema } from 'src/wallet/wallet.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { BaseService } from './base.service';
import {
  TransactionModel,
  TransactionSchema,
} from 'src/transaction/transaction.schema';
import {
  IdempotencyModel,
  IdempotencySchema,
} from 'src/transaction/idempotency.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserModel.name, schema: UserSchema },
      { name: WalletModel.name, schema: WalletSchema },
      { name: TransactionModel.name, schema: TransactionSchema },
      { name: IdempotencyModel.name, schema: IdempotencySchema },
    ]),
  ],
  providers: [BaseService],
  exports: [BaseService, MongooseModule],
})
export class BaseModule {}
