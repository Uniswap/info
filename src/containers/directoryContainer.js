import { Container } from 'unstated'

import { BASE_URL, Big } from '../helpers'

export class DirectoryContainer extends Container {
  state = {
    directory: [],
    exchanges: [],
    defaultExchangeAddress: '',
    activeExchange: {}
  }

  setActiveExchange = address => this.setState({ activeExchange: this.state.exchanges[address] })

  async fetchDirectory() {
    try {
      const data = await fetch(`${BASE_URL}v1/directory`)

      if (!data.ok) {
        throw Error(data.status)
      }

      const json = await data.json()

      let directoryObjects = {}
      json.exchanges.forEach(exchange => {
        directoryObjects[exchange.exchangeAddress] = buildDirectoryObject(exchange)
      })

      console.log(`fetched ${json.exchanges.length} exchanges`)

      await this.setState({
        directory: json.exchanges.map(exchange => buildDirectoryLabel(exchange)),
        exchanges: directoryObjects
      })

      // set default exchange address
      await this.setState({
        defaultExchangeAddress: this.state.directory[0].value
      })
    } catch (err) {
      console.log('error: ', err)
    }
  }

  // fetch exchange information via address
  async fetchTicker(address) {
    try {
      const data = await fetch(`${BASE_URL}v1/ticker?exchangeAddress=${address}`)

      if (!data.ok) {
        throw Error(data.status)
      }

      const json = await data.json()

      const { tradeVolume, ethLiquidity, priceChangePercent, erc20Liquidity, price, invPrice } = json

      let percentChange = ''
      const adjustedPriceChangePercent = (priceChangePercent * 100).toFixed(2)

      adjustedPriceChangePercent > 0 ? (percentChange = '+') : (percentChange = '')

      percentChange += adjustedPriceChangePercent

      console.log(`fetched ticker for ${address}`)

      // update "exchanges" with new information
      await this.setState(prevState => ({
        exchanges: {
          ...prevState.exchanges,
          [address]: {
            ...prevState.exchanges[address],
            price,
            invPrice,
            percentChange,
            tradeVolume: Big(tradeVolume).toFixed(4),
            ethLiquidity: Big(ethLiquidity).toFixed(4),
            erc20Liquidity: Big(erc20Liquidity).toFixed(4)
          }
        }
      }))

      // update "activeExchange" from now updated "exchanges"
      await this.setActiveExchange(address)
    } catch (err) {
      console.log('error: ', err)
    }
  }
}

const buildDirectoryLabel = exchange => {
  const { symbol, exchangeAddress } = exchange

  return {
    // label: `${symbol} - ${exchangeAddress}`,
    label: symbol,
    value: exchangeAddress
  }
}

const buildDirectoryObject = exchange => {
  const { name, symbol, exchangeAddress, tokenAddress, tokenDecimals, theme } = exchange

  return {
    name,
    symbol,
    exchangeAddress,
    tokenAddress,
    tokenDecimals,
    tradeVolume: 0,
    percentChange: 0.0,
    theme,
    price: 0,
    invPrice: 0,
    ethLiquidity: 0,
    erc20Liquidity: 0
  }
}
