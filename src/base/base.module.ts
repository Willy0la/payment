import { Module } from '@nestjs/common';
import { UserModel, UserSchema } from '../user/user.schema';
import { WalletModel, WalletSchema } from 'src/wallet/wallet.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { BaseService } from './base.service';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserModel.name, schema: UserSchema },
      { name: WalletModel.name, schema: WalletSchema },
    ]),
  ],
  providers: [BaseService],
  exports: [BaseService, MongooseModule],
})
export class BaseModule {}
