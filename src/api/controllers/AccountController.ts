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
import {
  TopLiquidityPoolsData,
  TopLiquidityPoolsParams,
  UserHistoryParams,
  UserMintsBurnsParams,
  UserParams,
  UserPositionData
} from 'api/types/AccountTypes'
import { SupportedNetwork } from 'constants/networks'
import IAccountController from './AccountController.interface'

class AccountController implements IAccountController {
  public getUserTransactions(account: string) {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
      case SupportedNetwork.TRON:
        return ApiService.graphqlClient.query<any, UserParams>({
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
        return ApiService.graphqlClient.query<any, UserHistoryParams>({
          query: USER_HISTORY,
          variables: {
            skip: skip,
            user: account
          },
          fetchPolicy: 'cache-first'
        })
    }
  }

  public getPairDayDataBulk(pairs: string[], startDateTimestamp: number) {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
      case SupportedNetwork.TRON:
        return ApiService.graphqlClient.query<any>({
          query: PAIR_DAY_DATA_BULK,
          variables: {
            pairs,
            startTimestamp: startDateTimestamp
          }
        })
    }
  }

  public getUserPositions(account: string) {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
      case SupportedNetwork.TRON:
        return ApiService.graphqlClient.query<UserPositionData, UserParams>({
          query: USER_POSITIONS,
          variables: {
            user: account
          },
          fetchPolicy: 'no-cache'
        })
    }
  }

  // ! currently disabled
  public getMiningPositions(account: string) {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
      case SupportedNetwork.TRON:
        return ApiService.graphqlClient.query<any>({
          query: MINING_POSITIONS,
          variables: {
            account
          },
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
        return ApiService.graphqlClient.query<TopLiquidityPoolsData, TopLiquidityPoolsParams>({
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
        return ApiService.graphqlClient.query<any, UserMintsBurnsParams>({
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
