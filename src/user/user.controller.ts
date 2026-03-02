import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

interface JwtUser {
  id: string;
  email: string;
  name?: string;
  userName?: string;
}
interface AuthRequest extends Request {
  user: JwtUser;
}

@Controller('user')
export class UserController {
  constructor(private readonly user: UserService) {}

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req: AuthRequest) {
    const userId = req.user.id;
    return await this.user.findUserById(userId);
  }
}
