import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'

import { ChainId } from '../constants'
import { SUBGRAPH_BLOCK_NUMBER } from './queries'

const EXCHANGE_SUBGRAPH_URLS = {
  mainnet: ['https://api.thegraph.com/subgraphs/name/dynamic-amm/dynamic-amm'],
  mainnetStaging: ['https://api.thegraph.com/subgraphs/name/piavgh/dmm-exchange-staging'],
  ropsten: ['https://api.thegraph.com/subgraphs/name/piavgh/dmm-exchange-ropsten'],
  polygon: [
    'https://api.thegraph.com/subgraphs/name/dynamic-amm/dmm-exchange-matic',
    'https://polygon-subgraph.knstats.com/subgraphs/name/dynamic-amm/dmm-exchange-matic',
  ],
  polygonStaging: ['https://api.thegraph.com/subgraphs/name/piavgh/dmm-exchange-matic-staging'],
  mumbai: ['https://api.thegraph.com/subgraphs/name/piavgh/dmm-exchange-mumbai'],
  bsc: [
    'https://api.thegraph.com/subgraphs/name/dynamic-amm/dmm-exchange-bsc',
    'https://bsc-subgraph.dmm.exchange/subgraphs/name/dynamic-amm/dmm-exchange-bsc',
  ],
  bscStaging: ['https://api.thegraph.com/subgraphs/name/ducquangkstn/dynamic-amm-bsc-staging'],
  bscTestnet: ['https://api.thegraph.com/subgraphs/name/ducquangkstn/dynamic-amm-ropsten'],
  avalanche: [
    'https://avax-subgraph.dmm.exchange/subgraphs/name/dynamic-amm/dmm-exchange-avax',
    'https://api.thegraph.com/subgraphs/name/dynamic-amm/dmm-exchange-avax',
  ],
  avalancheTestnet: ['https://api.thegraph.com/subgraphs/name/ducquangkstn/dmm-exchange-fuij'],
  fantom: [
    'https://api.thegraph.com/subgraphs/name/dynamic-amm/dmm-exchange-ftm',
    'https://fantom-subgraph.knstats.com/subgraphs/name/dynamic-amm/dmm-exchange-ftm',
  ],
  cronosTestnet: ['https://testnet-cronos-subgraph.knstats.com/subgraphs/name/dynamic-amm/dmm-exchange-cronos-testnet'],
  cronos: ['https://cronos-subgraph.kyberswap.com/subgraphs/name/kyberswap/kyberswap-cronos'],
  arbitrumTestnet: ['https://api.thegraph.com/subgraphs/name/viet-nv/kyberswap-arbitrum-rinkeby'],
  arbitrum: ['https://api.thegraph.com/subgraphs/name/viet-nv/kyberswap-arbitrum'],
  bttc: ['https://bttc-graph.dev.kyberengineering.io/subgraphs/name/dynamic-amm/kyberswap-bttc'],
}

export function getExchangeSubgraphUrls(networkId) {
  switch (networkId) {
    case ChainId.MAINNET:
      if (process.env.REACT_APP_MAINNET_ENV === 'staging') {
        return EXCHANGE_SUBGRAPH_URLS.mainnetStaging
      } else {
        return EXCHANGE_SUBGRAPH_URLS.mainnet
      }
    case ChainId.ROPSTEN:
      return EXCHANGE_SUBGRAPH_URLS.ropsten

    case ChainId.MATIC:
      if (process.env.REACT_APP_MAINNET_ENV === 'staging') {
        return EXCHANGE_SUBGRAPH_URLS.polygonStaging
      } else {
        return EXCHANGE_SUBGRAPH_URLS.polygon
      }
    case ChainId.MUMBAI:
      return EXCHANGE_SUBGRAPH_URLS.mumbai
    case ChainId.BSCMAINNET:
      if (process.env.REACT_APP_MAINNET_ENV === 'staging') {
        return EXCHANGE_SUBGRAPH_URLS.bscStaging
      } else {
        return EXCHANGE_SUBGRAPH_URLS.bsc
      }
    case ChainId.BSCTESTNET:
      return EXCHANGE_SUBGRAPH_URLS.bscTestnet
    case ChainId.AVAXMAINNET:
      return EXCHANGE_SUBGRAPH_URLS.avalanche
    case ChainId.AVAXTESTNET:
      return EXCHANGE_SUBGRAPH_URLS.avalancheTestnet
    case ChainId.FANTOM:
      return EXCHANGE_SUBGRAPH_URLS.fantom
    case ChainId.CRONOSTESTNET:
      return EXCHANGE_SUBGRAPH_URLS.cronosTestnet
    case ChainId.CRONOS:
      return EXCHANGE_SUBGRAPH_URLS.cronos
    case ChainId.ARBITRUM_TESTNET:
      return EXCHANGE_SUBGRAPH_URLS.arbitrumTestnet
    case ChainId.ARBITRUM:
      return EXCHANGE_SUBGRAPH_URLS.arbitrum
    case ChainId.BTTC:
      return EXCHANGE_SUBGRAPH_URLS.bttc
    default:
      return EXCHANGE_SUBGRAPH_URLS.mainnet
  }
}

export async function getExchangeSubgraphClient(chainId) {
  const subgraphUrls = getExchangeSubgraphUrls(chainId)

  if (subgraphUrls.length === 1) {
    return new ApolloClient({
      link: new HttpLink({
        uri: subgraphUrls[0],
      }),
      cache: new InMemoryCache(),
      shouldBatch: true,
    })
  }

  const subgraphClients = subgraphUrls.map(
    (uri) =>
      new ApolloClient({
        link: new HttpLink({
          uri,
        }),
        cache: new InMemoryCache(),
        shouldBatch: true,
      })
  )

  const subgraphPromises = subgraphClients.map((client) =>
    client
      .query({
        query: SUBGRAPH_BLOCK_NUMBER(),
        fetchPolicy: 'network-only',
      })
      .catch((e) => {
        console.error(e)
        return e
      })
  )

  const subgraphQueryResults = await Promise.all(subgraphPromises)

  const subgraphBlockNumbers = subgraphQueryResults.map((res) =>
    res instanceof Error ? 0 : res?.data?._meta?.block?.number || 0
  )

  let bestIndex = 0
  let maxBlockNumber = 0

  for (let i = 0; i < subgraphClients.length; i += 1) {
    if (subgraphBlockNumbers[i] > maxBlockNumber) {
      maxBlockNumber = subgraphBlockNumbers[i]
      bestIndex = i
    }
  }

  return subgraphClients[bestIndex]
}
