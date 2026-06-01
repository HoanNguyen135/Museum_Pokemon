import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';

import {
  persistStore,
  persistReducer,
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { appReducer } from './reducer';
// import logger from 'redux-logger';

const CURRENT_VERSION = 2;

const shouldLoadDebugger = __DEV__;

const reactotronInstance = shouldLoadDebugger
  ? require('../../ReactotronConfig').default
  : null;

const persistConfig = {
  key: 'Root',
  version: CURRENT_VERSION,
  storage: AsyncStorage,
  // migrate : async (state: any) => {

  // }
};

const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: Action,
) => {
  if (action.type === 'auth/logout') {
    return appReducer(undefined, action);
  }

  return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const middlewares = [];

export const store = configureStore({
  reducer: persistedReducer,
  enhancers: getDefaultEnhancers =>
    shouldLoadDebugger
      ? getDefaultEnhancers().concat(reactotronInstance.createEnhancer!())
      : getDefaultEnhancers(),
   middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware({
  //     serializableCheck: {
  //      ignoredActions: [
  //        FLUSH,
  //        REHYDRATE,
  //        PAUSE,
  //        PERSIST,
  //        PURGE,
  //        REGISTER,
  //        'auth/setCurrentUserAvailability',
  //        'contact/updateContactsPresence',
  //      ],
  //    },
  //    immutableCheck: { warnAfter: 256 },
  // }).concat(middlewares)
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
