import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';

export class DepositDto {
  @IsNumber()
  @IsPositive({ message: 'Amount must be greater than zero' })
  amount: number;
}

export class SendMoneyDto {
  @IsString()
  @IsNotEmpty()
  @Length(10, 10, { message: 'Receiver account number must be 10 digits' })
  receiverAccountNumber: string;

  @IsNumber()
  @IsPositive({ message: 'Amount must be greater than zero' })
  amount: number;
}
