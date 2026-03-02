import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  IsNumberString,
  Length,
  Matches,
} from 'class-validator';

export class SignUpDto {
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @IsString({ message: 'name must be a string' })
  name: string;
  @IsNotEmpty({ message: 'User Name cannot be empty' })
  @IsString({ message: 'User Name must be a string' })
  userName: string;

  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, {
    message: 'Email format is invalid or contains restricted characters',
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
  @IsNotEmpty()
  @IsNumberString({}, { message: 'PIN must be numeric' })
  @Length(6, 6, { message: 'PIN must be exactly 6 digits' })
  transactionPin: string;

  @IsNotEmpty({ message: 'User Name cannot be empty' })
  @IsPhoneNumber('NG')
  phoneNumber: string;
}
