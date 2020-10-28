import ApolloClient, { InMemoryCache } from 'apollo-boost';

import authManager from '../services/auth';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:1337';

const client = new ApolloClient({
  uri: `${API_BASE_URL}/graphql`,
  cache: new InMemoryCache(),
  onError: ({ graphQLErrors, response }) => {
    if (
      graphQLErrors?.length &&
      graphQLErrors[0]?.message === 'Invalid token.'
    ) {
      authManager.clear();
      response.errors = ['Usuário não autenticado.'];
      window.location.reload();
    }
  },
  request: ({ setContext }) => {
    const token = authManager.get();
    setContext({
      headers: {
        authorization: token ? `Bearer ${token}` : '',
      },
    });
  },
});

export default client;
