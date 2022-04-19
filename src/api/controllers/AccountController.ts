import ApiService from 'api/ApiService'
import {
  TOP_LPS_PER_PAIRS,
  USER_LIQUIDITY_POSITION_SNAPSHOTS,
  USER_MINTS_BURNS_PER_PAIR,
  USER_LIQUIDITY_POSITIONS,
  USER_TRANSACTIONS
} from 'api/queries/accounts'
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

  public getUserLiquidityPositionSnapshots(account: string, skip: number) {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
      case SupportedNetwork.TRON:
        return ApiService.graphqlClient.query<any, UserHistoryParams>({
          query: USER_LIQUIDITY_POSITION_SNAPSHOTS,
          variables: {
            skip: skip,
            user: account
          },
          fetchPolicy: 'cache-first'
        })
    }
  }

  public getUserLiquidityPositions(account: string) {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
      case SupportedNetwork.TRON:
        return ApiService.graphqlClient.query<UserPositionData, UserParams>({
          query: USER_LIQUIDITY_POSITIONS,
          variables: {
            user: account
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
          query: USER_MINTS_BURNS_PER_PAIR,
          variables: {
            user,
            pair
          }
        })
    }
  }
}

export default AccountController
