// user.types.ts

export interface RegisterUserInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface UpdateUserProfileInput {
  username?: string;
  email?: string;
  password?: string;
}

export interface IBasicUserDetails {
  _id: string;
  username: string;
  email: string;
}

export interface UserProfile extends IBasicUserDetails {
  token: string;
}

export interface IUser extends IBasicUserDetails {
  password?: string;
  matchPassword?: (enteredPassword: string) => Promise<boolean>;
}

export interface IUserQuery {
  _id?: string;
  email?: string;
  username?: string;
  passwaord?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: IBasicUserDetails;
    }
  }
}

interface IUserQuery {
  [key: string]: any; // Adjust as per your query structure
}
