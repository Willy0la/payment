import {
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

export const AppErrors = {
  UNAUTHORIZED: (msg?: string) =>
    new UnauthorizedException(msg || 'Unauthorized'),
  BAD_REQUEST: (msg?: string) => new BadRequestException(msg || 'Bad Request'),
  CONFLICTED_RESOURCES: (msg?: string) =>
    new ConflictException(msg || ' Conflicted Resources '),
  INTERNAL_SERVER: (msg?: string) =>
    new InternalServerErrorException(msg || 'Internal Server Error'),
  NOT_FOUND: (msg?: string) => {
    new NotFoundException(msg || 'User not found');
  },
};
