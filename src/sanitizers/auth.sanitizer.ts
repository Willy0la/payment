import { UserModel } from 'src/user/user.schema';
import { CreateUser } from '../interface/auth.interface';

export function authSanitizer(user: UserModel): CreateUser {
  return {
    userData: {
      id: user._id.toString(),
      name: user.name,
      userName: user.userName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      status: 'SUCCESS',
    },
  };
}
