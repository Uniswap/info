import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'

export const xyzClient = new ApolloClient({
  link: new HttpLink({
    uri: process.env.REACT_APP_SUBGRAPH_URL || 'https://api.thegraph.com/subgraphs/name/edwardevans094/devdmm',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswapv2',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const healthClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/index-node/graphql',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const v1Client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const blockClient = new ApolloClient({
  link: new HttpLink({
    uri:
      process.env.REACT_APP_SUBGRAPH_BLOCK_URL ||
      'https://api.thegraph.com/subgraphs/name/edwardevans094/ropsten-blocks',
  }),
  cache: new InMemoryCache(),
})
