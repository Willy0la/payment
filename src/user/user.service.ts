import { Injectable, Logger } from '@nestjs/common';
import { BaseService } from 'src/base/base.service';
import { AppErrors } from 'src/common/error';
import { userSanitizer } from 'src/sanitizers/user.sanitizers';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);
  constructor(private readonly baseRepo: BaseService) {
    this.logger.log('Auth Service has been initialized');
  }
  async findUserById(id: string) {
    const user = await this.baseRepo.findUserById(id);
    if (!user) {
      throw new AppErrors.NOT_FOUND('User not found');
    }
    return userSanitizer(user);
  }
}
