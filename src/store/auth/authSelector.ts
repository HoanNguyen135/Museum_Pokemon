import {createSelector} from '@reduxjs/toolkit';
import {RootState} from '..';

export const selectAuth = (state: RootState) => state.auth;

export const selectUser = createSelector(selectAuth, auth => auth.user);
