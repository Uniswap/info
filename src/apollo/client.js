import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'

export const client = new ApolloClient({
  // By default, this client will send queries to the
  //  `/graphql` endpoint on the same host
  // Pass the configuration option { uri: YOUR_GRAPHQL_API_URL } to the `HttpLink` to connect
  // to a different host
  link: new HttpLink({
    // uri: 'https://api.thegraph.com/subgraphs/name/graphprotocol/uniswap'
    uri: 'https://api.thegraph.com/subgraphs/id/QmaP38sXSXBYaC9uqnBH2UjZiowygNTy6YjEZMRJxU6z6X'
  }),
  cache: new InMemoryCache()
})
