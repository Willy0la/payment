import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TransactionStatus, TransactionType } from './transaction.enum';
import { UserModel } from 'src/user/user.schema';

@Schema({
  timestamps: true,
  collection: 'transactions',
  toJSON: { getters: true },
  toObject: { getters: true },
})
export class TransactionModel extends Document {
  @Prop({
    type: Types.ObjectId,
    ref: UserModel.name,
    required: true,
    index: true,
  })
  sender: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: UserModel.name,
    required: true,
    index: true,
  })
  receiver: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  amount: number;

  @Prop({ type: String, enum: TransactionType, required: true })
  transactionType: TransactionType;

  @Prop({ type: String, enum: TransactionStatus, required: true })
  transactionStatus: TransactionStatus;

  @Prop({ type: String, required: true, unique: true })
  transactionID: string;

  @Prop({ type: String, required: false })
  reference: string;
}

export const TransactionSchema = SchemaFactory.createForClass(TransactionModel);
