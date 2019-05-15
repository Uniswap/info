import { Container } from 'unstated'

import { Big } from '../helpers'
import { client } from '../apollo/client'
import { DIRECTORY_QUERY, TICKER_QUERY } from '../apollo/queries'

export class DirectoryContainer extends Container {
  state = {
    directory: [],
    exchanges: [],
    defaultExchangeAddress: '',
    activeExchange: {}
  }

  setActiveExchange = address =>
    this.setState({ activeExchange: this.state.exchanges[address] })

  async fetchDirectory () {
    try {
      let data = []
      let dataEnd = false
      let skip = 0
      while (!dataEnd) {
        let result = await client.query({
          query: DIRECTORY_QUERY,
          variables: {
            first: 100,
            skip: skip
          },
          fetchPolicy: 'network-only',
        })
        data = data.concat(result.data.exchanges)
        skip = skip + 100
        if (result.data.exchanges.length !== 100) {
          dataEnd = true
        }
      }
      console.log(`fetched ${data.length} exchanges for directory`)
      let directoryObjects = {}
      data.forEach(exchange => {
        directoryObjects[exchange.id] = buildDirectoryObject(exchange)
      })

      await this.setState({
        directory: data.map(exchange => buildDirectoryLabel(exchange)),
        exchanges: directoryObjects
      })

      let mkrDefault
      for (let i = 0; i < this.state.directory.length; i++) {
        if (this.state.directory[i].label === 'MKR') {
          mkrDefault = this.state.directory[i].value
          break
        }
      }
      // set default exchange address
      await this.setState({
        defaultExchangeAddress: mkrDefault
      })

    } catch (err) {
      console.log('error: ', err)
    }
  }

  // fetch exchange information via address
  async fetchTicker (address) {
    try {
      const result = await client.query({
        query: TICKER_QUERY,
        variables: {
          id: address
        },
        fetchPolicy: 'network-only',
      })
      let data
      if (result) {
        data = result.data.exchange
        console.log(data)
      }

      const {
        price,
        ethBalance,
        tokenBalance,
        tradeVolumeEth,
        tradeVolumeToken
      } = data

      // TODO - real percent price change, match their real volume

      const invPrice = 1 / price
      let percentChange = '0.555'

      // let percentChange = ''
      // const adjustedPriceChangePercent = (priceChangePercent * 100).toFixed(2)
      //
      // adjustedPriceChangePercent > 0
      //   ? (percentChange = '+')
      //   : (percentChange = '')
      //
      // percentChange += adjustedPriceChangePercent

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
            tradeVolume: Big(tradeVolumeEth).toFixed(4),
            ethLiquidity: Big(ethBalance).toFixed(4),
            erc20Liquidity: Big(tokenBalance).toFixed(4)
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
  const { tokenSymbol, id } = exchange
  const exchangeAddress = id

  return {
    label: tokenSymbol,
    value: exchangeAddress
  }
}

const buildDirectoryObject = exchange => {
  const {
    tokenName,
    tokenSymbol,
    id,
    tokenAddress,
    tokenDecimals,
    theme
  } = exchange

  const exchangeAddress = id

  return {
    tokenName,
    tokenSymbol,
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
