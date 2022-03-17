import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { useMemo } from 'react'
import { useNetworksInfo } from '../contexts/NetworkInfo'

export const useClient = () => {
  const [networksInfo] = useNetworksInfo()

  const client = useMemo(
    () =>
      new ApolloClient({
        link: new HttpLink({
          uri: networksInfo.SUBGRAPH_URL[0],
        }),
        cache: new InMemoryCache(),
        shouldBatch: true,
      }),
    [networksInfo]
  )
  return client
}

export const healthClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/index-node/graphql',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const getBlockClient = networksInfo =>
  new ApolloClient({
    link: new HttpLink({
      uri: networksInfo?.SUBGRAPH_BLOCK_URL,
    }),
    cache: new InMemoryCache(),
  })
