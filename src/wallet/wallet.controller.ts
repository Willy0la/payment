import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { SendMoneyDto, DepositDto } from './wallet.dto';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

interface AuthRequest extends Request {
  user: { _id: string };
}

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('send-money')
  async sendMoney(@Body() dto: SendMoneyDto, @Req() req: AuthRequest) {
    const userId = req.user?._id?.toString();
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.walletService.sendMoney(userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('deposit')
  async deposit(@Body() dto: DepositDto, @Req() req: AuthRequest) {
    const userId = req.user?._id?.toString();
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.walletService.deposit(userId, dto);
  }
}
