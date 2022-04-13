import ApiService from 'api/ApiService'
import {
  MINING_POSITIONS,
  TOP_LPS_PER_PAIRS,
  USER_HISTORY,
  USER_MINTS_BUNRS_PER_PAIR,
  USER_POSITIONS,
  USER_TRANSACTIONS
} from 'api/queries/accounts'
import { PAIR_DAY_DATA_BULK } from 'api/queries/pairs'
import { SupportedNetwork } from 'constants/networks'

class AccountController {
  public getUserTransactions(account: string) {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
      case SupportedNetwork.TRON:
        return ApiService.graphqlClient.query({
          query: USER_TRANSACTIONS,
          variables: {
            user: account
          },
          fetchPolicy: 'no-cache'
        })
    }
  }

  public getUserHistory(account: string, skip: number) {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
      case SupportedNetwork.TRON:
        return ApiService.graphqlClient.query({
          query: USER_HISTORY,
          variables: {
            skip: skip,
            user: account
          },
          fetchPolicy: 'cache-first'
        })
    }
  }

  public getUserLiquidityChart(pairs: string[], startDateTimestamp: number) {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
      case SupportedNetwork.TRON:
        return ApiService.graphqlClient.query({
          query: PAIR_DAY_DATA_BULK(pairs, startDateTimestamp)
        })
    }
  }

  public getUserPositions(account: string) {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
      case SupportedNetwork.TRON:
        return ApiService.graphqlClient.query({
          query: USER_POSITIONS,
          variables: {
            user: account
          },
          fetchPolicy: 'no-cache'
        })
    }
  }

  public getMiningPositions(account: string) {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
      case SupportedNetwork.TRON:
        return ApiService.graphqlClient.query({
          query: MINING_POSITIONS(account),
          context: {
            client: 'stake'
          },
          fetchPolicy: 'no-cache'
        })
    }
  }

  public getTopLiquidityPools(pair: string) {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
      case SupportedNetwork.TRON:
        return ApiService.graphqlClient.query({
          query: TOP_LPS_PER_PAIRS,
          variables: {
            pair
          },
          fetchPolicy: 'cache-first'
        })
    }
  }

  public getUserMintsBurnsPerPair(user: string, pair: string) {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
      case SupportedNetwork.TRON:
        return ApiService.graphqlClient.query({
          query: USER_MINTS_BUNRS_PER_PAIR,
          variables: {
            user,
            pair
          }
        })
    }
  }
}

export default AccountController
