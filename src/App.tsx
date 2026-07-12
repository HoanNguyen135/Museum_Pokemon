import React from 'react';
import {Provider} from 'react-redux';
import {persistor, store} from './store';
import AppNavigator from './navigation';
import {PersistGate} from 'redux-persist/integration/react';
import codePush from '@code-push-next/react-native-code-push';
import {ApolloClient, HttpLink, InMemoryCache} from '@apollo/client';
import {ApolloProvider} from '@apollo/client/react';

// Initialize Apollo Client
const client = new ApolloClient({
  link: new HttpLink({uri: 'http://localhost:4000/graphql'}),
  cache: new InMemoryCache(),
});

const MainApp = () => {
  return (
    <ApolloProvider client={client}>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <AppNavigator />
        </PersistGate>
      </Provider>
    </ApolloProvider>
  );
};

const codePushOptions = {
  checkFrequency: codePush.CheckFrequency.MANUAL,
  installMode: codePush.InstallMode.IMMEDIATE,
};
export default codePush(codePushOptions)(MainApp);
