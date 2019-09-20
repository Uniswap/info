import { Container } from 'unstated'
import dayjs from 'dayjs'
import { Big } from '../helpers'
import { client } from '../apollo/client'
import { DIRECTORY_QUERY, TICKER_QUERY, TICKER_24HOUR_QUERY } from '../apollo/queries'

export class DirectoryContainer extends Container {
  state = {
    directory: [],
    exchanges: [],
    defaultIndex: 0,
    defaultExchangeAddress: '',
    activeExchange: { exchangeAddress: '' }
  }

  setActiveExchange = address => this.setState({ activeExchange: this.state.exchanges[address] })

  // fetch all exchanges data
  async fetchDirectory() {
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
          fetchPolicy: 'network-only'
        })
        data = data.concat(result.data.exchanges)
        skip = skip + 100
        if (result.data.exchanges.length !== 100) {
          dataEnd = true
        }
      }

      let query = window.location.search.match(new RegExp('[?&]' + 'token' + '=([^&#?]*)'))

      let directoryObjects = {}

      let defaultExchange = null

      data.forEach(exchange => {
        if (
          (query && exchange.tokenAddress.toString().toUpperCase() === query[1].toString().toUpperCase()) ||
          (query && exchange.tokenSymbol && query[1].toString().toUpperCase() === exchange.tokenSymbol.toUpperCase())
        ) {
          defaultExchange = exchange.id
        }
        return (directoryObjects[exchange.id] = buildDirectoryObject(exchange))
      })

      await this.setState({
        directory: data.map(exchange => buildDirectoryLabel(exchange)),
        exchanges: directoryObjects
      })

      if (!defaultExchange) {
        defaultExchange = this.state.directory[0].value
      }

      // set default exchange address
      await this.setState({
        defaultExchangeAddress: defaultExchange
      })
    } catch (err) {
      console.log('error: ', err)
    }
  }

  // fetch exchange information via address
  async fetchTicker(address) {
    try {
      const result = await client.query({
        query: TICKER_QUERY,
        variables: {
          id: address
        },
        fetchPolicy: 'network-only'
      })
      let data
      if (result) {
        data = result.data.exchange
      }
      const { price, ethBalance, tokenBalance, tradeVolumeEth, priceUSD } = data

      let data24HoursAgo
      try {
        const utcCurrentTime = dayjs()
        const utcOneDayBack = utcCurrentTime.subtract(1, 'day')
        const result24HoursAgo = await client.query({
          query: TICKER_24HOUR_QUERY,
          variables: {
            exchangeAddr: address,
            timestamp: utcOneDayBack.unix()
          },
          fetchPolicy: 'network-only'
        })
        if (result24HoursAgo) {
          data24HoursAgo = result24HoursAgo.data.exchangeHistoricalDatas[0]
        }
      } catch (err) {
        console.log('error: ', err)
      }
      const invPrice = 1 / price

      let volumePercentChange = ''
      const adjustedVolumeChangePercent = (
        ((tradeVolumeEth - data24HoursAgo.tradeVolumeEth) / tradeVolumeEth) *
        100
      ).toFixed(2)
      adjustedVolumeChangePercent > 0 ? (volumePercentChange = '+') : (volumePercentChange = '')
      volumePercentChange += adjustedVolumeChangePercent

      let pricePercentChange = ''

      const adjustedPriceChangePercent = (((priceUSD - data24HoursAgo.tokenPriceUSD) / priceUSD) * 100).toFixed(2)
      adjustedPriceChangePercent > 0 ? (pricePercentChange = '+') : (pricePercentChange = '')
      pricePercentChange += adjustedPriceChangePercent

      let liquidityPercentChange = ''
      const adjustedPriceChangeLiquidity = (((ethBalance - data24HoursAgo.ethBalance) / ethBalance) * 100).toFixed(2)
      adjustedPriceChangeLiquidity > 0 ? (liquidityPercentChange = '+') : (liquidityPercentChange = '')
      liquidityPercentChange += adjustedPriceChangeLiquidity

      let oneDayVolume = tradeVolumeEth - data24HoursAgo.tradeVolumeEth

      // update "exchanges" with new information
      await this.setState(prevState => ({
        exchanges: {
          ...prevState.exchanges,
          [address]: {
            ...prevState.exchanges[address],
            price,
            invPrice,
            priceUSD,
            pricePercentChange,
            volumePercentChange,
            liquidityPercentChange,
            tradeVolume: parseFloat(Big(oneDayVolume).toFixed(4)),
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
  let { tokenSymbol, id } = exchange
  const exchangeAddress = id
  if (tokenSymbol === null) {
    tokenSymbol = 'unknown'
  }
  return {
    label: tokenSymbol,
    value: exchangeAddress
  }
}

const buildDirectoryObject = exchange => {
  let { tokenName, tokenSymbol, id, tokenAddress, tokenDecimals } = exchange
  let symbol = tokenSymbol

  const exchangeAddress = id

  let theme = hardcodeThemes[exchangeAddress]
  if (theme === undefined) {
    theme = ''
  }

  return {
    tokenName,
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

// These are previously received from the loanscan api. Only 5 were found
const hardcodeThemes = {
  '0x2c4bd064b998838076fa341a83d007fc2fa50957': '#1abc9c',
  '0xae76c84c9262cdb9abc0c2c8888e62db8e22a0bf': '#302c2c',
  '0x09cabec1ead1c0ba254b09efb3ee13841712be14': '#fdc134',
  '0x4e395304655f0796bc3bc63709db72173b9ddf98': '#00b4f4',
  '0x2e642b8d59b45a1d8c5aef716a84ff44ea665914': '#ff5000'
}
