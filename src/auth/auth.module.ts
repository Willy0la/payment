import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BaseService } from 'src/base/base.service';
import { UserSchema, UserModel } from 'src/user/user.schema';
import { WalletModel, WalletSchema } from 'src/wallet/wallet.schema';
import { BaseModule } from 'src/base/base.module';
import { JwtStrategy } from 'src/guard/strategy';

@Module({
  imports: [
    BaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],

      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('SECRET'),
        signOptions: { expiresIn: config.get<number>('TTL') },
      }),
    }),
    MongooseModule.forFeature([
      { name: UserModel.name, schema: UserSchema },
      { name: WalletModel.name, schema: WalletSchema },
    ]),
  ],

  providers: [AuthService, BaseService, JwtStrategy],
  controllers: [AuthController],
  exports: [JwtModule, PassportModule, AuthService, BaseService, JwtStrategy],
})
export class AuthModule {}
