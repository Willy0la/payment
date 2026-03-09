import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TransactionModel } from './transaction.schema';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(TransactionModel.name)
    private readonly transactionModel: Model<TransactionModel>,
  ) {}

  async getUserHistory(userId: string) {
    const userObjectId = new Types.ObjectId(userId);

    return this.transactionModel
      .find({
        $or: [{ sender: userObjectId }, { receiver: userObjectId }],
      })
      .populate('sender', 'name userName email')
      .populate('receiver', 'name userName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getTransactionByTxnId(transactionID: string) {
    return this.transactionModel
      .findOne({ transactionID })
      .populate('sender receiver', 'name userName')
      .exec();
  }
}
