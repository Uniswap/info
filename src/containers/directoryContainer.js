import { Container } from 'unstated'
import dayjs from 'dayjs'
import { Big } from '../helpers'
import { client } from '../apollo/client'
import { DIRECTORY_QUERY, TICKER_QUERY, TICKER_24HOUR_QUERY } from '../apollo/queries'
import { hardcodedExchanges } from '../constants/exchanges'
import { hardcodeThemes } from '../constants/theme'

export class DirectoryContainer extends Container {
  state = {
    directory: [],
    exchanges: [],
    defaultIndex: 0,
    defaultExchangeAddress: '',
    activeExchange: { exchangeAddress: '' }
  }

  setActiveExchange = address => {
    if (this.state.exchanges[address]) {
      this.setState({ activeExchange: this.state.exchanges[address] })
    }
  }

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
            first: 1000,
            skip: skip
          },
          fetchPolicy: 'network-only'
        })
        data = data.concat(result.data.exchanges)
        skip = skip + 1000
        if (result.data.exchanges.length !== 1000) {
          dataEnd = true
        }
      }

      let query = window.location.search.match(new RegExp('[?&]token=([^&#?]*)'))

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
  async fetchOverviewData(address) {
    /**
     * get today's data
     */
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
      const { price, ethBalance, tokenBalance, tradeVolumeEth, tradeVolumeToken, priceUSD } = data

      /**
       * get yesterdays data
       */
      let data24HoursAgo = {}
      let dataNowForTxs = {}
      try {
        // const utcCurrentTime = dayjs()
        const utcCurrentTime = dayjs('2019-05-17')
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
      try {
        // const utcCurrentTime = dayjs()
        const utcCurrentTime = dayjs('2019-05-17')
        const resultLatest = await client.query({
          query: TICKER_24HOUR_QUERY,
          variables: {
            exchangeAddr: address,
            timestamp: utcCurrentTime.unix()
          },
          fetchPolicy: 'network-only'
        })
        if (resultLatest) {
          dataNowForTxs = resultLatest.data.exchangeHistoricalDatas[0]
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

      let volumePercentChangeUSD = ''
      const adjustedVolumeChangePercentUSD = (
        ((tradeVolumeToken - data24HoursAgo.tradeVolumeToken) / tradeVolumeToken) *
        100
      ).toFixed(2)
      adjustedVolumeChangePercentUSD > 0 ? (volumePercentChangeUSD = '+') : (volumePercentChangeUSD = '')
      volumePercentChangeUSD += adjustedVolumeChangePercentUSD

      let pricePercentChange = ''
      const adjustedPriceChangePercent = (((priceUSD - data24HoursAgo.tokenPriceUSD) / priceUSD) * 100).toFixed(2)
      adjustedPriceChangePercent > 0 ? (pricePercentChange = '+') : (pricePercentChange = '')
      pricePercentChange += adjustedPriceChangePercent

      let pricePercentChangeETH = ''
      const adjustedPriceChangePercentETH = (((price - data24HoursAgo.price) / price) * 100).toFixed(2)
      adjustedPriceChangePercentETH > 0 ? (pricePercentChangeETH = '+') : (pricePercentChangeETH = '')
      pricePercentChangeETH += adjustedPriceChangePercentETH

      let liquidityPercentChange = ''
      const adjustedPriceChangeLiquidity = (((ethBalance - data24HoursAgo.ethBalance) / ethBalance) * 100).toFixed(2)
      adjustedPriceChangeLiquidity > 0 ? (liquidityPercentChange = '+') : (liquidityPercentChange = '')
      liquidityPercentChange += adjustedPriceChangeLiquidity

      let liquidityPercentChangeUSD = ''
      const adjustedPriceChangeLiquidityUSD = (
        ((ethBalance * price * priceUSD -
          data24HoursAgo.ethBalance * data24HoursAgo.price * data24HoursAgo.tokenPriceUSD) /
          (ethBalance * price * priceUSD)) *
        100
      ).toFixed(2)
      adjustedPriceChangeLiquidityUSD > 0 ? (liquidityPercentChangeUSD = '+') : (liquidityPercentChangeUSD = '')
      liquidityPercentChangeUSD += adjustedPriceChangeLiquidityUSD

      let txsPercentChange = ''
      const adjustedTxChangePercent = (
        ((dataNowForTxs.totalTxsCount - data24HoursAgo.totalTxsCount) / dataNowForTxs.totalTxsCount) *
        100
      ).toFixed(2)
      adjustedTxChangePercent > 0 ? (txsPercentChange = '+') : (txsPercentChange = '')
      txsPercentChange += adjustedTxChangePercent

      let oneDayVolume = tradeVolumeEth - data24HoursAgo.tradeVolumeEth
      let oneDayVolumeUSD = tradeVolumeToken * priceUSD - data24HoursAgo.tradeVolumeToken * priceUSD

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
            pricePercentChangeETH,
            volumePercentChange,
            volumePercentChangeUSD,
            liquidityPercentChange,
            liquidityPercentChangeUSD,
            tradeVolume: parseFloat(Big(oneDayVolume).toFixed(4)),
            tradeVolumeUSD: parseFloat(Big(oneDayVolumeUSD).toFixed(4)),
            ethLiquidity: Big(ethBalance).toFixed(4),
            usdLiquidity: Big(tokenBalance * priceUSD).toFixed(4),
            txsPercentChange
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
  let { tokenSymbol, id, tokenAddress } = exchange
  const exchangeAddress = id

  if (tokenSymbol === null) {
    if (hardcodedExchanges.hasOwnProperty(exchangeAddress.toUpperCase())) {
      tokenSymbol = hardcodedExchanges[exchangeAddress.toUpperCase()].symbol
    } else {
      tokenSymbol = 'unknown'
    }
  }

  return {
    label: tokenSymbol,
    value: exchangeAddress,
    tokenAddress: tokenAddress
  }
}

const buildDirectoryObject = exchange => {
  let { tokenName, tokenSymbol, id, tokenAddress, tokenDecimals, ethBalance } = exchange
  let symbol = tokenSymbol

  const exchangeAddress = id

  let theme = hardcodeThemes[exchangeAddress]

  return {
    tokenName,
    symbol,
    exchangeAddress,
    tokenAddress,
    tokenDecimals,
    ethBalance,
    tradeVolume: 0,
    percentChange: 0.0,
    theme,
    price: 0,
    invPrice: 0,
    ethLiquidity: 0,
    erc20Liquidity: 0
  }
}
