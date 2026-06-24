import { IsString, ValidateIf, IsNotEmpty } from 'class-validator';
import { AtLeastOneOf } from 'src/common/validator/customDecorator';
export class LoginDto {
  @IsNotEmpty({ message: 'Identifier cannot be empty' })
  @IsString({ message: 'Identifier must be a string' })
  identifier: string;

  @AtLeastOneOf('password', 'transactionPin')
  @ValidateIf((o) => o.password !== undefined)
  @IsString({ message: 'Password must be a string' })
  password?: string;

  @ValidateIf((o) => o.transactionPin !== undefined)
  @IsString({ message: 'Transaction PIN must be a string' })
  transactionPin?: string;
}
