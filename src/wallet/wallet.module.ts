import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { WalletModel, WalletSchema } from './wallet.schema';
import { BaseService } from 'src/base/base.service';
import { UserModel, UserSchema } from 'src/user/user.schema';
import { BaseModule } from 'src/base/base.module';
import { WalletService } from './wallet.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: WalletModel.name, schema: WalletSchema },
      { name: UserModel.name, schema: UserSchema },
    ]),
    BaseModule,
  ],
  providers: [BaseService, WalletService],
  controllers: [WalletController],
})
export class WalletModule {}
