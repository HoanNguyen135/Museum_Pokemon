import {User} from '@/types/User';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ApiErrorResponse {
  success: boolean;
  errors: string[];
}

export interface ApiErrorResponse {
  success: boolean;
  errors: string[];
}

export interface LoginResponse {
  user: User;
}
