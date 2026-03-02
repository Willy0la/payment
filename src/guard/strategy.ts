import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserModel } from 'src/user/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(UserModel.name) private readonly userModel: Model<UserModel>,
  ) {
    const secret = configService.get<string>('SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in configuration');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }
  async validate(payload: { sub: string }) {
    const user = await this.userModel.findById(payload.sub).select('-password');

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    if (user.loginLockedUntil && user.loginLockedUntil > new Date()) {
      throw new UnauthorizedException('Account is currently locked');
    }

    return user;
  }
}
