import { UserModel } from 'src/user/user.schema';

export function userSanitizer(user: UserModel) {
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
