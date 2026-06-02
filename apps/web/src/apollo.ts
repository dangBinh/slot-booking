import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

// Vite inlines VITE_* env vars at build time. Default to localhost for `pnpm dev`;
// the Docker build passes VITE_API_URL as a build arg.
const uri = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000/graphql';

export const apolloClient = new ApolloClient({
  link: new HttpLink({ uri }),
  cache: new InMemoryCache(),
});
