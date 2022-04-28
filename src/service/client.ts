import { ApolloClient, ApolloLink, DefaultOptions, HttpLink, InMemoryCache } from 'apollo-boost'
import { SupportedNetwork } from 'constants/networks'
import { getCurrentNetwork } from 'utils'
import config from './config'

enum GraphQlClient {
  health = 'health',
  stake = 'stake',
  block = 'block'
}

const defaultOptions: DefaultOptions = {
  query: {
    fetchPolicy: 'cache-first'
  }
}

const clientLink = new HttpLink({
  uri: config.clientUrl
})
const healthClientLink = new HttpLink({
  uri: config.healthClientUrl
})
const blockClientLink = new HttpLink({
  uri: config.blockClientUrl
})
const stakingClientLink = new HttpLink({
  uri: config.stakingClientUrl
})

function initApolloClient(network: SupportedNetwork) {
  switch (network) {
    case SupportedNetwork.ETHEREUM: {
      const directionalLink = ApolloLink.split(
        operation => operation.getContext().client === GraphQlClient.health, // use health  url
        healthClientLink,
        ApolloLink.split(
          operation => operation.getContext().client === GraphQlClient.block, // use block url
          blockClientLink,
          ApolloLink.split(
            operation => operation.getContext().client === GraphQlClient.stake, // use stake url
            stakingClientLink,
            clientLink // otherwise use client url
          )
        )
      )
      return new ApolloClient({ link: directionalLink, cache: new InMemoryCache(), defaultOptions })
    }
    case SupportedNetwork.TRON:
    default: {
      // TODO: remove when trx graphql server appears
      const directionalLink = ApolloLink.split(
        operation => operation.getContext().client === GraphQlClient.health, // use health  url
        healthClientLink,
        ApolloLink.split(
          operation => operation.getContext().client === GraphQlClient.block, // use block url
          blockClientLink,
          ApolloLink.split(
            operation => operation.getContext().client === GraphQlClient.stake, // use stake url
            stakingClientLink,
            clientLink // otherwise use client url
          )
        )
      )
      return new ApolloClient({
        link: directionalLink,
        cache: new InMemoryCache(),
        defaultOptions
      })
    }
  }
}

let client = initApolloClient(getCurrentNetwork().id)

function changeApiClient(network: SupportedNetwork) {
  client = initApolloClient(network)
}

export { client, changeApiClient }
