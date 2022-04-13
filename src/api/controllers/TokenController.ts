import ApiService from 'api/ApiService'
import { ALL_TOKENS, TOKENS_CURRENT, TOKENS_DYNAMIC, TOKEN_CHART, TOKEN_DATA, TOKEN_SEARCH } from 'api/queries/tokens'
import { SupportedNetwork } from 'constants/networks'

class TokenController {
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
          query: TOKENS_DYNAMIC(block),
          fetchPolicy: 'cache-first'
        })
    }
  }

  public getTokenData(tokenAddress: string, block: number) {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
      case SupportedNetwork.TRON:
        return ApiService.graphqlClient.query({
          query: TOKEN_DATA(tokenAddress, block),
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

  public getAllTokens(skip: number) {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
      case SupportedNetwork.TRON:
        return ApiService.graphqlClient.query({
          query: ALL_TOKENS,
          variables: {
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
