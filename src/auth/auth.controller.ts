import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/signin.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async createUser(@Body() dto: SignUpDto) {
    return await this.authService.signup(dto);
  }
  @Post('signin')
  async loginUser(@Body() dto: LoginDto) {
    return await this.authService.signin(dto);
  }
}
