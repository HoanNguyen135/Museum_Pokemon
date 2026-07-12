import {combineReducers} from '@reduxjs/toolkit';
import authSlice from '@/store/auth/authSlice';
import settingsSlice from '@/store/settings/settingsSlice';

export const appReducer = combineReducers({
  auth: authSlice,
  settings: settingsSlice,
});
