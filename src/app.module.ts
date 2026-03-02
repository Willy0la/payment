import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ControllerModule } from './controller/controller.module';
import { BaseService } from './base/base.service';
import { WalletModule } from './wallet/wallet.module';
import { BaseModule } from './base/base.module';
import * as Joi from 'joi';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '.env.development.local',
        '.env.staging',
        '.env.production',
      ],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid(),
        DB: Joi.string().valid(),
        PORT: Joi.number().valid(),
        TTL: Joi.number().valid(),
        SECRET: Joi.string().valid(),
      }),
      validationOptions: {
        abortEarly: true,
        allUnknown: true,
      },
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('DB'),
        serverSelectionTimeoutMS: 5000,
        bufferCommands: false,
      }),
    }),
    UserModule,
    AuthModule,
    ControllerModule,
    WalletModule,
    BaseModule,
  ],
  controllers: [AppController],
  providers: [AppService, BaseService],
})
export class AppModule {}
