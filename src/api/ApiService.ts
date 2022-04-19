import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, NormalizedCacheObject } from 'apollo-boost'
import axios, { AxiosInstance } from 'axios'
import { SupportedNetwork } from 'constants/networks'
import { getCurrentNetwork } from 'utils'
import config from './config'

enum GraphQlClient {
  health = 'health',
  stake = 'stake',
  block = 'block'
}

class ApiService {
  private readonly restApiHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
  private readonly clientLink: HttpLink
  private readonly healthClientLink: HttpLink
  private readonly stakingClientLink: HttpLink
  private readonly blockClientLink: HttpLink
  private readonly restApiUrl = config.restApiUrl

  public readonly graphqlClient: ApolloClient<NormalizedCacheObject>
  public readonly restApi: AxiosInstance
  public activeNetwork: SupportedNetwork

  constructor() {
    this.clientLink = new HttpLink({
      uri: config.graphQL.clientUrl
    })
    this.healthClientLink = new HttpLink({
      uri: config.graphQL.healthClientUrl
    })
    this.blockClientLink = new HttpLink({
      uri: config.graphQL.blockClientUrl
    })
    this.stakingClientLink = new HttpLink({
      uri: config.graphQL.stakingClientUrl
    })

    const directionalLink = ApolloLink.split(
      operation => operation.getContext().client === GraphQlClient.health, // use health  url
      this.healthClientLink,

      ApolloLink.split(
        operation => operation.getContext().client === GraphQlClient.block, // use block url
        this.blockClientLink,

        ApolloLink.split(
          operation => operation.getContext().client === GraphQlClient.stake, // use stake url
          this.stakingClientLink,
          this.clientLink // otherwise use client url
        )
      )
    )

    this.graphqlClient = new ApolloClient({
      link: directionalLink,
      cache: new InMemoryCache()
    })

    this.restApi = axios.create({
      baseURL: this.restApiUrl,
      headers: this.restApiHeaders
    })

    this.activeNetwork = getCurrentNetwork().id
  }

  public setActiveNetwork(network: SupportedNetwork) {
    this.activeNetwork = network
  }
}

export default new ApiService()
