import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const GRAPHQL_API_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_API_URL ??
  "https://rickandmortyapi.com/graphql";

export const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: GRAPHQL_API_URL }),
  cache: new InMemoryCache(),
});
