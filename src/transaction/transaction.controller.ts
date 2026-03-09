import { Controller, Get } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}
  @UseGuards(AuthGuard('jwt'))
  @Get('history')
  async getHistory(@Req() req: any) {
    const userId = req.user.id;
    return this.transactionService.getUserHistory(userId);
  }
}
