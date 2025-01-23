import { IBasicUserDetails } from "./user";

export interface AuthResponse extends IBasicUserDetails {
  token: string;
}
