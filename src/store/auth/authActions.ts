import { createAsyncThunk } from '@reduxjs/toolkit';
import { ApiErrorResponse, LoginPayload, LoginResponse } from './authTypes';

import { handleApiError } from './authUtils';
import I18n from '@/i18n';
import { AuthService } from './authService';

const createAuthThunk = <TResponse, TPayload>(
  type: string,
  handler: (payload: TPayload) => Promise<TResponse>,
  errorMessage?: string,
) => {
  return createAsyncThunk<
    TResponse,
    TPayload,
    { rejectValue: ApiErrorResponse }
  >(type, async (payload, { rejectWithValue }) => {
    try {
      return await handler(payload);
    } catch (error) {
      return rejectWithValue(handleApiError(error, errorMessage));
    }
  });
};

export const authActions = {
  login: createAuthThunk<LoginResponse, LoginPayload>(
    'auth/login',
    AuthService.login,
    I18n.t('ERRORS.AUTH'),
  ),
};
