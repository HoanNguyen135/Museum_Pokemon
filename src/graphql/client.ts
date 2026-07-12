import {ApolloClient, HttpLink, InMemoryCache} from '@apollo/client';

// Initialize Apollo Client
export const client = new ApolloClient({
  link: new HttpLink({uri: 'http://localhost:4000/graphql'}),
  cache: new InMemoryCache(),
});
