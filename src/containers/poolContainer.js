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
      const data = await fetch(`${BASE_URL}v1/user?exchangeAddress=${exchangeAddress}&userAddress=${userAccount}`)

      if (!data.ok) {
        throw Error(data.status)
      }

      const json = await data.json()

      console.log(`fetched ${userAccount}'s pool share for ${exchangeAddress}`)

      this.setState({
        userNumPoolTokens: Big(json.userNumPoolTokens).toFixed(4),
        userPoolPercent: (json.userPoolPercent * 100).toFixed(2)
      })
    } catch (err) {
      console.log('error: ', err)
    }
  }
}
