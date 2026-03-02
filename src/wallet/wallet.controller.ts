import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { SendMoneyDto, DepositDto } from './wallet.dto';
import { Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { JwtStrategy } from 'src/guard/strategy';

interface AuthRequest extends Request {
  user: { userId: string };
}

interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
}

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('send-money')
  async sendMoney(@Body() dto: SendMoneyDto, @Req() req: any) {
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const userId = req.user._id.toString();

    return this.walletService.sendMoney(userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('deposit')
  async deposit(@Body() dto: DepositDto, @Req() req: any) {
    const userId = req.user?._id?.toString();
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }
    return this.walletService.deposit(userId, dto);
  }
}
