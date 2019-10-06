import { Container } from 'unstated'

import { BASE_URL, Big } from '../helpers'

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
      const userData = await fetch(`${BASE_URL}v1/user?exchangeAddress=${exchangeAddress}&userAddress=${userAccount}`)

      if (!userData.ok) {
        throw Error(userData.status)
      }

      const userJson = await userData.json()

      const exchangeData = await fetch(`${BASE_URL}v1/exchange?exchangeAddress=${exchangeAddress}`)

      if (!exchangeData.ok) {
        throw Error(exchangeData.status)
      }

      const exchangeJson = await exchangeData.json()

      console.log(`fetched ${userAccount}'s pool share for ${exchangeAddress}`)

      // NOTE: workaround for bug in uniswap-statistics-api
      // uniswap-statistics-api returns numbers that don't take into account
      // tokens that have fewer than 18 decimal places
      // see: https://github.com/loanscan/uniswap-statistics-api/issues/7
      const tokenDecimals = exchangeJson.tokenDecimals
      const userNumPoolTokens = Big(userJson.userNumPoolTokens).dividedBy(10**(18 - tokenDecimals)).toFixed(4)
      const userPoolPercent = Big(userJson.userPoolPercent * 100).dividedBy(10**(18 - tokenDecimals)).toFixed(2)
      this.setState({
        userNumPoolTokens: userNumPoolTokens,
        userPoolPercent: userPoolPercent
      })
    } catch (err) {
      console.log('error: ', err)
    }
  }
}
