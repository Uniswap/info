import ApiService from 'api/ApiService'
import { TOKENS_CURRENT, TOKENS_DYNAMIC, TOKEN_CHART, TOKEN_DATA, TOKEN_SEARCH } from 'api/queries/tokens'
import { SupportedNetwork } from 'constants/networks'
import ITokenController from './TokenController.interface'

class TokenController implements ITokenController {
  public getCurrentTokens() {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
      case SupportedNetwork.TRON:
        return ApiService.graphqlClient.query({
          query: TOKENS_CURRENT,
          fetchPolicy: 'cache-first'
        })
    }
  }

  public getDynamicTokens(block: number) {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
      case SupportedNetwork.TRON:
        return ApiService.graphqlClient.query({
          query: TOKENS_DYNAMIC,
          variables: {
            block
          },
          fetchPolicy: 'cache-first'
        })
    }
  }

  public getTokenData(tokenAddress: string, block: number) {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
      case SupportedNetwork.TRON:
        return ApiService.graphqlClient.query({
          query: TOKEN_DATA,
          variables: {
            tokenAddress,
            block: block ? { number: block } : null
          },
          fetchPolicy: 'cache-first'
        })
    }
  }

  public getTokenChart(tokenAddress: string, skip: number) {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
      case SupportedNetwork.TRON:
        return ApiService.graphqlClient.query({
          query: TOKEN_CHART,
          variables: {
            tokenAddr: tokenAddress,
            skip
          },
          fetchPolicy: 'cache-first'
        })
    }
  }

  public searchToken(value: string, id: string) {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
      case SupportedNetwork.TRON:
        return ApiService.graphqlClient.query({
          query: TOKEN_SEARCH,
          variables: {
            value,
            id
          }
        })
    }
  }
}

export default TokenController
