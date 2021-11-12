import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'

const domain = process.env.REACT_APP_GRAPH_DOMAIN

export const client = new ApolloClient({
  link: new HttpLink({
    uri: `${domain}/subgraphs/name/pham/exchange`,
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const healthClient = new ApolloClient({
  link: new HttpLink({
    uri: `${domain}/index-node/graphql`,
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const v1Client = new ApolloClient({
  link: new HttpLink({
    uri: `${domain}/subgraphs/name/ianlapham/uniswap`,
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const stakingClient = new ApolloClient({
  link: new HttpLink({
    uri: `${domain}/subgraphs/name/way2rach/talisman`,
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const blockClient = new ApolloClient({
  link: new HttpLink({
    uri: `${domain}/subgraphs/name/pancakeswap/blocks`,
  }),
  cache: new InMemoryCache(),
})
