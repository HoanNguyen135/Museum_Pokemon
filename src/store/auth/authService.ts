import {LoginPayload, LoginResponse} from './authTypes';

export class AuthService {
  static async login(credentials: LoginPayload): Promise<LoginResponse> {
    const response: any = {};

    return {
      user: response?.data?.data,
    } as LoginResponse;
  }
}
