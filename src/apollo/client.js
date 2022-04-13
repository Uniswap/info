import { ApolloLink } from 'apollo-link'
import { ApolloClient, HttpLink, InMemoryCache } from 'apollo-boost'

const clientLink = new HttpLink({
  uri: 'https://api.thegraph.com/subgraphs/name/whiteswapfi/whiteswap'
})

const healthClientLink = new HttpLink({
  uri: 'https://api.thegraph.com/index-node/graphql'
})

const blockClientLink = new HttpLink({
  uri: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks'
})

const stakeClientLink = new HttpLink({
  uri: 'https://api.thegraph.com/subgraphs/name/way2rach/talisman'
})

// use enum for checking context client
const directionalLink = ApolloLink.split(
  operation => operation.getContext().client === 'health', // use health  url
  healthClientLink,

  ApolloLink.split(
    operation => operation.getContext().client === 'block', // use block url
    blockClientLink,

    ApolloLink.split(
      operation => operation.getContext().client === 'stake', // use stake url
      stakeClientLink,
      clientLink // otherwise use client url
    )
  )
)

export const client = new ApolloClient({
  link: directionalLink,
  cache: new InMemoryCache(),
  shouldBatch: true
})
