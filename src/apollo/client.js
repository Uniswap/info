import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'

export const client = new ApolloClient({
  // By default, this client will send queries to the
  //  `/graphql` endpoint on the same host
  // Pass the configuration option { uri: YOUR_GRAPHQL_API_URL } to the `HttpLink` to connect
  // to a different host
  link: new HttpLink({
    // pending uniswap2 with broken trade volume
    // uri: 'https://api.thegraph.com/subgraphs/id/QmaaL3LyWjSDint7ZcykbgtGifVhS4ND3Ey4VJhd6gD7vj'

    // pending uniswap with 'fixed' trade volumne
    uri: 'https://api.thegraph.com/subgraphs/id/QmdcNsBW9x12BPgPtCrvid2hvUgJgiUvYERPNBo6ZXKPhN'
    // uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap'
  }),
  cache: new InMemoryCache()
})
