import {User} from '@/types/User';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {authActions} from './authActions';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  uiFlags: {
    isLoggingIn: boolean;
    isResettingPassword: boolean;
    isVerifyingMfa: boolean;
  };
  error: string | null;
  mfaToken: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  uiFlags: {
    isLoggingIn: false,
    isResettingPassword: false,
    isVerifyingMfa: false,
  },
  error: null,
  mfaToken: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setDataUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    logout: state => {
      // in rootReducer, there is an action to CLEAR the complete Redux Store's state
    },
  },
  extraReducers: builder => {
    builder
      .addCase(authActions.login.pending, (state, action) => {
        state.uiFlags.isLoggingIn = true;
        state.error = null;
      })
      .addCase(authActions.login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.uiFlags.isLoggingIn = false;
        state.error = null;
      })
      .addCase(authActions.login.rejected, (state, action) => {
        state.uiFlags.isLoggingIn = false;
        state.error = action.payload?.errors[0] ?? null;
      });
  },
});

export const setDataUser = authSlice.actions.setDataUser;
export const logout = authSlice.actions.logout;

export default authSlice.reducer;
