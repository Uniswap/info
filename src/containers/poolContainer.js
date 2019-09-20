import { Container } from 'unstated'

import { Big } from '../helpers'

import { client } from '../apollo/client'
import { TOTAL_POOL_QUERY, USER_POOL_QUERY } from '../apollo/queries'

export class PoolContainer extends Container {
  state = {
    userNumPoolTokens: (0).toFixed(4),
    userPoolPercent: (0).toFixed(2)
  }

  resetUserPool = () =>
    this.setState({
      userNumPoolTokens: (0).toFixed(4),
      userPoolPercent: (0).toFixed(2)
    })

  async fetchUserPool(exchangeAddress, userAccount) {
    try {
      const resultPool = await client.query({
        query: TOTAL_POOL_QUERY,
        variables: {
          id: exchangeAddress
        },
        fetchPolicy: 'network-only'
      })
      let poolData
      if (resultPool) {
        poolData = resultPool.data
        // console.log(`fetched total uni tokens  for ${exchangeAddress}`)
        const resultUser = await client.query({
          query: USER_POOL_QUERY,
          variables: {
            id: poolData.exchange.tokenAddress.concat('-', userAccount)
          },
          fetchPolicy: 'network-only'
        })
        let userData
        if (resultUser) {
          userData = resultUser.data
          if (userData.userExchangeData == null) {
            // console.log(`user ${exchangeAddress}-${userAccount} has no balance`)
            this.setState({
              userNumPoolTokens: Big(0).toFixed(4),
              userPoolPercent: ((0 / poolData.exchange.totalUniToken) * 100).toFixed(2)
            })
          } else {
            // console.log(`fetched user balance for ${exchangeAddress}-${userAccount}`)
            this.setState({
              userNumPoolTokens: Big(userData.userExchangeData.uniTokenBalance).toFixed(4),
              userPoolPercent: (
                (userData.userExchangeData.uniTokenBalance / poolData.exchange.totalUniToken) *
                100
              ).toFixed(2)
            })
          }
        }
      }
    } catch (err) {
      console.log('error: ', err)
    }
  }
}
