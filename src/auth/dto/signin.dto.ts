import { IsString, ValidateIf, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'User Name cannot be empty' })
  @IsString({ message: 'User Name must be a string' })
  identifier: string;
  @ValidateIf((o) => o.password !== undefined)
  @IsString({ message: 'Password must be a string' })
  password?: string;

  @ValidateIf((o) => o.transactionPin !== undefined)
  @IsString({ message: 'Transaction PIN must be a string' })
  transactionPin?: string;
}
