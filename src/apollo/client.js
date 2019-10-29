import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'

export const client = new ApolloClient({
  // By default, this client will send queries to the
  //  `/graphql` endpoint on the same host
  // Pass the configuration option { uri: YOUR_GRAPHQL_API_URL } to the `HttpLink` to connect
  // to a different host
  link: new HttpLink({
    // pending 1 has updated volume tracking, historical data
    // uri: 'https://api.thegraph.com/subgraphs/id/QmdwtSn8C8x5keGJ3xApqRMQqbLj3yNETL1JSNLhaUHFdc'

    // 3 is deployed without tx coutn and without price fix
    uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap'
  }),
  cache: new InMemoryCache()
})
