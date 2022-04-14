import ApiService from 'api/ApiService'
import {
  ETH_PRICE,
  GET_BLOCK,
  GET_BLOCKS,
  GLOBAL_CHART,
  GLOBAL_DATA,
  GLOBAL_TXNS,
  PRICES_BY_BLOCK,
  SHARE_VALUE,
  SUBGRAPH_HEALTH
} from 'api/queries/global'
import { BlockHeight } from 'api/types'
import { FACTORY_ADDRESS } from '../../constants'
import { SupportedNetwork } from 'constants/networks'
import IGlobalController from './GlobalController.interface'

class GlobalController implements IGlobalController {
  public getGlobalData(block?: number) {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
      case SupportedNetwork.TRON:
        return ApiService.graphqlClient.query({
          query: GLOBAL_DATA,
          variables: {
            block: block ? { number: block } : null,
            factoryAddress: FACTORY_ADDRESS
          },
          fetchPolicy: 'cache-first'
        })
    }
  }

  public getGlobalChart(startTime: number, skip: number) {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
      case SupportedNetwork.TRON:
        return ApiService.graphqlClient.query({
          query: GLOBAL_CHART,
          variables: {
            startTime,
            skip
          },
          fetchPolicy: 'cache-first'
        })
    }
  }

  public getGlobalTransactions() {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
      case SupportedNetwork.TRON:
        return ApiService.graphqlClient.query({
          query: GLOBAL_TXNS,
          fetchPolicy: 'cache-first'
        })
    }
  }

  public getPrice(block?: number) {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
      case SupportedNetwork.TRON:
        return ApiService.graphqlClient.query({
          query: ETH_PRICE,
          variables: {
            block: block ? { number: block } : null
          },
          fetchPolicy: 'cache-first'
        })
    }
  }

  public getPricesByBlock(tokenAddress: string, blocks: BlockHeight[]) {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
      case SupportedNetwork.TRON:
        return ApiService.graphqlClient.query({
          query: PRICES_BY_BLOCK(tokenAddress, blocks),
          fetchPolicy: 'cache-first'
        })
    }
  }

  public getBlocks(timestamps: number[]) {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
      case SupportedNetwork.TRON:
        return ApiService.graphqlClient.query({
          query: GET_BLOCKS(timestamps),
          fetchPolicy: 'cache-first',
          context: {
            client: 'block'
          }
        })
    }
  }

  public getBlock(timestampFrom: number, timestampTo: number) {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
      case SupportedNetwork.TRON:
        return ApiService.graphqlClient.query({
          query: GET_BLOCK,
          fetchPolicy: 'cache-first',
          variables: {
            timestampFrom,
            timestampTo
          },
          context: {
            client: 'block'
          }
        })
    }
  }

  public getHealthStatus() {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
      case SupportedNetwork.TRON:
        return ApiService.graphqlClient.query({
          query: SUBGRAPH_HEALTH,
          context: {
            client: 'health'
          }
        })
    }
  }

  public getShareValue(pairAddress: string, blocks: BlockHeight[]) {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
      case SupportedNetwork.TRON:
        return ApiService.graphqlClient.query({
          query: SHARE_VALUE(pairAddress, blocks),
          fetchPolicy: 'cache-first'
        })
    }
  }
}

export default GlobalController
