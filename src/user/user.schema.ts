import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'userofbank', timestamps: true })
export class UserModel extends Document {
  @Prop({ type: String, required: true })
  name: string;
  @Prop({ type: String, required: true, unique: true })
  userName: string;
  @Prop({ type: String, required: true, unique: true })
  email: string;
  @Prop({ type: String, required: true })
  password: string;
  @Prop({ type: String, required: true, unique: true })
  phoneNumber: string;
  @Prop({ type: String, required: true, unique: true })
  accountNumber: string;
  @Prop({ type: Boolean, default: true })
  isActive: boolean;
  @Prop({ type: String, required: true })
  transactionPin: string;

  @Prop({ type: Number, default: 0 })
  loginRetryCount: number;

  @Prop({ type: Date, default: null })
  loginLockedUntil: Date | null;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);

UserSchema.pre('save', async function () {
  if (this.deletedAt !== null) {
    this.isActive = false;
  } else {
    this.isActive = true;
  }
});
