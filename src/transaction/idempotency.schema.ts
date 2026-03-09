import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
  collection: 'idempotency_keys',
})
export class IdempotencyModel extends Document {
  @Prop({ type: String, required: true, unique: true, index: true })
  key: string;

  @Prop({ type: String, required: true })
  transactionID: string;

  @Prop({ type: String, required: true })
  status: string;

  @Prop({ type: Object, required: false })
  previousResponse?: any;

  @Prop({ type: Date, expires: '24h', default: Date.now })
  createdAt: Date;
}

export const IdempotencySchema = SchemaFactory.createForClass(IdempotencyModel);
