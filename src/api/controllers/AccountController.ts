import ApiService from 'api/ApiService'
import { MINING_POSITIONS, USER_HISTORY, USER_POSITIONS, USER_TRANSACTIONS } from 'api/queries/accounts'
import { PAIR_DAY_DATA_BULK } from 'api/queries/pairs'
import { SupportedNetwork } from 'constants/networks'

class AccountController {
  public getUserTransactions(account: string) {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
        return ApiService.graphQlApi.query({
          query: USER_TRANSACTIONS,
          variables: {
            user: account
          },
          fetchPolicy: 'no-cache'
        })
      case SupportedNetwork.TRON:
        return ApiService.restApi.get('/filter/transactions')
    }
  }

  public getUserHistory(account: string, skip: number) {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
        return ApiService.graphQlApi.query({
          query: USER_HISTORY,
          variables: {
            skip: skip,
            user: account
          },
          fetchPolicy: 'cache-first'
        })
      case SupportedNetwork.TRON:
        return ApiService.restApi.get('/filter/transactions')
    }
  }

  public getUserLiquidityChart(pairs: string[], startDateTimestamp: number) {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
        return ApiService.graphQlApi.query({
          query: PAIR_DAY_DATA_BULK(pairs, startDateTimestamp)
        })
      case SupportedNetwork.TRON:
        return ApiService.restApi.get('/filter/transactions')
    }
  }

  public getUserPositions(account: string) {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
        return ApiService.graphQlApi.query({
          query: USER_POSITIONS,
          variables: {
            user: account
          },
          fetchPolicy: 'no-cache'
        })
      case SupportedNetwork.TRON:
        return ApiService.restApi.get('/filter/transactions')
    }
  }

  public getMiningPositions(account: string) {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
        return ApiService.graphQlApi.query({
          query: MINING_POSITIONS(account),
          context: {
            client: 'stake'
          },
          fetchPolicy: 'no-cache'
        })
      case SupportedNetwork.TRON:
        return ApiService.restApi.get('/filter/transactions')
    }
  }
}

export default AccountController
