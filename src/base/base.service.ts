import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { UserModel } from 'src/user/user.schema';
import { SignUpDto } from 'src/auth/dto/signup.dto';
import * as bcryptjs from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Currency, Status } from 'src/wallet/wallet.enum';
import { WalletModel } from 'src/wallet/wallet.schema';
import { TransactionModel } from 'src/transaction/transaction.schema';
import { IdempotencyModel } from 'src/transaction/idempotency.schema';

@Injectable()
export class BaseService {
  private logger = new Logger(BaseService.name);

  constructor(
    @InjectModel(UserModel.name) private readonly userModel: Model<UserModel>,
    @InjectModel(WalletModel.name)
    private readonly walletModel: Model<WalletModel>,
    @InjectModel(TransactionModel.name)
    private readonly transactionModel: Model<TransactionModel>,
    @InjectModel(IdempotencyModel.name)
    private readonly idempotencyModel: Model<IdempotencyModel>,
  ) {
    this.logger.log('BaseService initialized');
  }

  async findOneUser(userName: string, email: string) {
    return this.userModel.findOne({ $or: [{ userName }, { email }] }).exec();
  }

  async findUserById(id: string) {
    return await this.userModel.findById(id).select('-password');
  }
  async findAllUser() {
    return await this.userModel.find().select('-password');
  }
  async createUser(dto: SignUpDto, session: mongoose.ClientSession) {
    const { name, userName, email, password, phoneNumber, transactionPin } =
      dto;
    const accountNumber = phoneNumber.replace(/\D/g, '').slice(-10);
    const salt = await bcryptjs.genSalt(12);

    const [hashedPassword, hashedPin] = await Promise.all([
      bcryptjs.hash(password, salt),
      bcryptjs.hash(transactionPin, salt),
    ]);

    const [user] = await this.userModel.create(
      [
        {
          name,
          userName,
          email,
          password: hashedPassword,
          transactionPin: hashedPin,
          phoneNumber,
          accountNumber,
        },
      ],
      { session },
    );

    return user;
  }

  async findUserFromContext(userId: string): Promise<UserModel | null> {
    if (!userId) return null;
    return this.userModel.findById(userId).exec();
  }

  async findUserByEmailOrUsername(identifier: string) {
    return this.userModel
      .findOne({
        $or: [{ email: identifier }, { userName: identifier }],
      })
      .exec();
  }

  async verifyPassword(user: UserModel, password: string): Promise<boolean> {
    return bcryptjs.compare(password, user.password);
  }

  async verifyTransactionPin(user: UserModel, pin: string): Promise<boolean> {
    return bcryptjs.compare(pin, user.transactionPin);
  }

  async createWalletForUser(userId: string, session: mongoose.ClientSession) {
    if (!userId) throw new Error('User ID is required to create wallet');

    const [wallet] = await this.walletModel.create(
      [
        {
          userId,
          currency: Currency.NGN,
          balance: 0,
          status: Status.ACTIVE,
        },
      ],
      { session },
    );

    return wallet;
  }

  async incrementFailedAttempts(user: UserModel) {
    const maxRetries = 5;
    const lockTimeMinutes = 15;

    user.loginRetryCount += 1;

    if (user.loginRetryCount >= maxRetries && !user.loginLockedUntil) {
      const lockUntil = new Date();
      lockUntil.setMinutes(lockUntil.getMinutes() + lockTimeMinutes);
      user.loginLockedUntil = lockUntil;

      this.logger.warn(
        `User account  locked (retries: ${user.loginRetryCount}) `,
      );
    }

    await user.save();
  }
  async resetFailedAttempts(user: UserModel) {
    if (user.loginRetryCount > 0 || user.loginLockedUntil) {
      user.loginRetryCount = 0;
      user.loginLockedUntil = null;
      this.logger.warn(`User ${user.userName} loginRetryCount reset`);
      await user.save();
    }
  }

  async clearExpiredLock(user: UserModel) {
    if (user.loginLockedUntil && user.loginLockedUntil <= new Date()) {
      user.loginLockedUntil = null;
      user.loginRetryCount = 0;
      await user.save();
    }
  }

  async findWalletByUserId(
    userId: string,
    currency: Currency,
    session?: mongoose.ClientSession,
  ) {
    return this.walletModel
      .findOne({ userId, currency })
      .session(session || null);
  }

  async softDeleteUser(userId: string) {
    const session = await this.userModel.db.startSession();
    session.startTransaction();
    try {
      const user = await this.userModel.findByIdAndUpdate(
        userId,
        { deletedAt: new Date(), isActive: false },
        { new: true, session },
      );

      if (!user) {
        throw new Error('User not found');
      }

      await this.walletModel.updateMany(
        { userId: user._id },
        { status: Status.CLOSED },
        { session },
      );

      await session.commitTransaction();
      return true;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async findUserByAccountNumber(
    accountNumber: string,
    session?: mongoose.ClientSession,
  ) {
    return this.userModel.findOne({ accountNumber }).session(session || null);
  }

  async decrementWalletBalance(
    userId: string,
    amount: number,
    session: mongoose.ClientSession,
  ) {
    return this.walletModel.findOneAndUpdate(
      {
        userId,
        currency: Currency.NGN,
        balance: { $gte: amount },
      },
      {
        $inc: { balance: -amount },
      },
      { new: true, session },
    );
  }

  async incrementWalletBalance(
    userId: string,
    amount: number,
    session?: mongoose.ClientSession,
  ) {
    return this.walletModel.findOneAndUpdate(
      {
        userId,
        currency: Currency.NGN,
      },
      {
        $inc: { balance: amount },
      },
      { new: true, session },
    );
  }

  async createTransaction(
    data: Partial<TransactionModel>,
    session: mongoose.ClientSession,
  ) {
    return await this.transactionModel.create([data], { session });
  }

  async findIdempotencyKey(key: string, session?: mongoose.ClientSession) {
    return this.idempotencyModel.findOne({ key }).session(session || null);
  }

  async createIdempotencyKey(
    data: {
      key: string;
      transactionID: string;
      status: string;
      previousResponse?: any;
    },
    session: mongoose.ClientSession,
  ) {
    return await this.idempotencyModel.create([data], { session });
  }
}
