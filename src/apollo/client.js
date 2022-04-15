import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { useMemo } from 'react'
import { useNetworksInfo } from '../contexts/NetworkInfo'

export const useClient = () => {
  const [networksInfo] = useNetworksInfo()

  const client = useMemo(
    () =>
      networksInfo.map(
        networkInfo =>
          new ApolloClient({
            link: new HttpLink({
              uri: networkInfo.subgraphUrls[0],
            }),
            cache: new InMemoryCache(),
            shouldBatch: true,
          })
      ),
    [JSON.stringify(networksInfo)]
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
      uri: networksInfo?.subgraphBlockUrl,
    }),
    cache: new InMemoryCache(),
  })
