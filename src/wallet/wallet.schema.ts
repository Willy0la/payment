import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Currency, Status } from './wallet.enum';
import { UserModel } from 'src/user/user.schema';

@Schema({
  collection: 'userWallet',
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true },
})
export class WalletModel extends Document {
  @Prop({
    type: Types.ObjectId,
    ref: UserModel.name,
    required: true,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    uppercase: true,
    minlength: 3,
    maxlength: 3,
    enum: Currency,
    default: Currency.NGN,
  })
  currency: Currency;

  @Prop({
    type: Number,
    default: 0,
    set: (v: number) => Math.round(v * 100),
    get: (v: number) => v / 100,
  })
  balance: number;

  @Prop({
    type: String,
    enum: Status,
    default: Status.ACTIVE,
  })
  status: Status;
}

export const WalletSchema = SchemaFactory.createForClass(WalletModel);

WalletSchema.index({ userId: 1, currency: 1 }, { unique: true });
