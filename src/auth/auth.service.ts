import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';
import { BaseService } from 'src/base/base.service';
import mongoose, { Connection } from 'mongoose';
import { LoginDto } from './dto/signin.dto';
import { InjectConnection } from '@nestjs/mongoose';

import { authSanitizer } from 'src/sanitizers/auth.sanitizer';
import { AppErrors } from 'src/common/error';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  constructor(
    private readonly baseRepo: BaseService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @InjectConnection() private readonly connection: Connection,
  ) {
    this.logger.log('Auth Service has been initialized');
  }

  async signup(dto: SignUpDto) {
    this.logger.log(`DB State: ${mongoose.connection.readyState}`);
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const { userName, email } = dto;

      const existingUser = await this.baseRepo.findOneUser(userName, email);
      if (existingUser) {
        throw AppErrors.CONFLICTED_RESOURCES(
          `User with username :${userName} already exists`,
        );
      }

      const newUser = await this.baseRepo.createUser(dto, session);

      await this.baseRepo.createWalletForUser(newUser._id.toString(), session);

      await session.commitTransaction();

      const payload = { sub: newUser._id };
      const token = this.jwtService.sign(payload);

      return {
        sanitized: authSanitizer(newUser),
        token,
      };
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async signin(dto: LoginDto) {
    const { password, transactionPin, identifier } = dto;

    if (!password && !transactionPin) {
      throw AppErrors.BAD_REQUEST('Password or transaction PIN is required');
    }

    if (password && transactionPin) {
      throw AppErrors.BAD_REQUEST('Provide either password or PIN, not both');
    }

    const user = await this.baseRepo.findUserByEmailOrUsername(identifier);
    if (!user || user.deletedAt)
      throw AppErrors.UNAUTHORIZED('Invalid credentials');

    await this.baseRepo.clearExpiredLock(user);

    if (user.loginLockedUntil) {
      throw AppErrors.UNAUTHORIZED('Account temporarily locked');
    }

    let isValid = false;

    if (password) {
      isValid = await this.baseRepo.verifyPassword(user, password);
    } else if (transactionPin !== undefined) {
      isValid = await this.baseRepo.verifyTransactionPin(user, transactionPin);
    }

    if (!isValid) {
      await this.baseRepo.incrementFailedAttempts(user);
      throw AppErrors.UNAUTHORIZED('Invalid Credential');
    }

    const token = this.jwtService.sign({ sub: user._id });

    return {
      sanitized: authSanitizer(user),
      token,
    };
  }
}
