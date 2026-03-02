import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel, UserSchema } from './user.schema';
import { BaseService } from 'src/base/base.service';
import { WalletModule } from '../wallet/wallet.module';
import { BaseModule } from 'src/base/base.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
    WalletModule,
    BaseModule,
  ],
  controllers: [UserController],
  providers: [UserService, BaseService],
})
export class UserModule {}
