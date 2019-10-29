import { Container } from 'unstated'
import dayjs from 'dayjs'
import { Big } from '../helpers'
import { client } from '../apollo/client'
import { DIRECTORY_QUERY, TICKER_QUERY, TICKER_24HOUR_QUERY } from '../apollo/queries'
import { hardcodedExchanges } from '../constants/exchanges'
import { hardcodeThemes } from '../constants/theme'
import { getChangeValues } from '../helpers'

export class DirectoryContainer extends Container {
  state = {
    directory: [],
    exchanges: [],
    defaultIndex: 0,
    defaultExchangeAddress: '',
    activeExchange: { exchangeAddress: '' }
  }

  // used to switch between current exchange on token page
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

      /**
       * Get all the exchanges on Uniswap, and collect symbol, ticker, etc
       * skip is max items the graph can return, should support 1000 now
       */
      while (!dataEnd) {
        let result = await client.query({
          query: DIRECTORY_QUERY,
          variables: {
            first: 1000,
            skip: skip
          }
        })
        data = data.concat(result.data.exchanges)

        // loop if haven't found all yet
        skip = skip + 1000
        if (result.data.exchanges.length !== 1000) {
          dataEnd = true
        }
      }

      let directoryObjects = {}
      let defaultExchange = null

      /**
       * Basical version of custom linking.
       *
       * @todo - replace this with address based routing at an app level
       */
      let query = window.location.search.match(new RegExp('[?&]token=([^&#?]*)'))
      data.forEach(exchange => {
        if (
          (query && exchange.tokenAddress.toString().toUpperCase() === query[1].toString().toUpperCase()) ||
          (query && exchange.tokenSymbol && query[1].toString().toUpperCase() === exchange.tokenSymbol.toUpperCase())
        ) {
          defaultExchange = exchange.id
        }
        return (directoryObjects[exchange.id] = buildDirectoryObject(exchange))
      })

      // create a label for each used in dropdowns
      await this.setState({
        directory: data.map(exchange => buildDirectoryLabel(exchange)),
        exchanges: directoryObjects
      })

      /**
       * Set default exchange if not one yet
       *
       * @todo - when moved to context allow for no selected exchange (when overview selected)
       */

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
    // get the current state of the exchange
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
      const { price, ethBalance, tradeVolumeEth, tradeVolumeToken, priceUSD, totalTxsCount } = data

      let data24HoursAgo = {}
      let data48HoursAgo = {}

      // get data from 24 hours ago
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

      // get data from 24 hours ago
      try {
        const utcCurrentTime = dayjs()
        const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day')
        const result48HoursAgo = await client.query({
          query: TICKER_24HOUR_QUERY,
          variables: {
            exchangeAddr: address,
            timestamp: utcTwoDaysBack.unix()
          },
          fetchPolicy: 'network-only'
        })
        if (result48HoursAgo) {
          data48HoursAgo = result48HoursAgo.data.exchangeHistoricalDatas[0]
        }
      } catch (err) {
        console.log('error: ', err)
      }

      // set default values to 0 (for exchanges that are brand new and dont have 24 hour data yet)
      const invPrice = 1 / price
      let pricePercentChange = 0
      let pricePercentChangeETH = 0
      let volumePercentChange = 0
      let volumePercentChangeUSD = 0
      let liquidityPercentChange = 0
      let liquidityPercentChangeUSD = 0
      let oneDayVolume = 0
      let oneDayTxs = 0
      let oneDayVolumeUSD = 0
      let txsPercentChange = 0

      if (data24HoursAgo && data48HoursAgo) {
        volumePercentChange = ''
        const adjustedVolumeChangePercent = (
          ((tradeVolumeEth - data24HoursAgo.tradeVolumeEth) / tradeVolumeEth) *
          100
        ).toFixed(2)
        adjustedVolumeChangePercent > 0 ? (volumePercentChange = '+') : (volumePercentChange = '')
        volumePercentChange += adjustedVolumeChangePercent

        volumePercentChangeUSD = ''
        const adjustedVolumeChangePercentUSD = (
          ((tradeVolumeToken - data24HoursAgo.tradeVolumeToken) / tradeVolumeToken) *
          100
        ).toFixed(2)
        adjustedVolumeChangePercentUSD > 0 ? (volumePercentChangeUSD = '+') : (volumePercentChangeUSD = '')
        volumePercentChangeUSD += adjustedVolumeChangePercentUSD

        pricePercentChange = ''
        const adjustedPriceChangePercent = (((priceUSD - data24HoursAgo.tokenPriceUSD) / priceUSD) * 100).toFixed(2)
        adjustedPriceChangePercent > 0 ? (pricePercentChange = '+') : (pricePercentChange = '')
        pricePercentChange += adjustedPriceChangePercent

        pricePercentChangeETH = ''
        const adjustedPriceChangePercentETH = (((price - data24HoursAgo.price) / price) * 100).toFixed(2)
        adjustedPriceChangePercentETH > 0 ? (pricePercentChangeETH = '+') : (pricePercentChangeETH = '')
        pricePercentChangeETH += adjustedPriceChangePercentETH

        liquidityPercentChange = ''
        const adjustedPriceChangeLiquidity = (((ethBalance - data24HoursAgo.ethBalance) / ethBalance) * 100).toFixed(2)
        adjustedPriceChangeLiquidity > 0 ? (liquidityPercentChange = '+') : (liquidityPercentChange = '')
        liquidityPercentChange += adjustedPriceChangeLiquidity

        liquidityPercentChangeUSD = ''
        const adjustedPriceChangeLiquidityUSD = (
          ((ethBalance * price * priceUSD -
            data24HoursAgo.ethBalance * data24HoursAgo.price * data24HoursAgo.tokenPriceUSD) /
            (ethBalance * price * priceUSD)) *
          100
        ).toFixed(2)
        adjustedPriceChangeLiquidityUSD > 0 ? (liquidityPercentChangeUSD = '+') : (liquidityPercentChangeUSD = '')
        liquidityPercentChangeUSD += adjustedPriceChangeLiquidityUSD

        oneDayVolume = tradeVolumeEth - data24HoursAgo.tradeVolumeEth
        oneDayVolumeUSD = tradeVolumeToken * priceUSD - data24HoursAgo.tradeVolumeToken * priceUSD

        let [, txsPercentChangeNew] = getChangeValues(
          totalTxsCount,
          data24HoursAgo.totalTxsCount,
          data48HoursAgo.totalTxsCount
        )

        txsPercentChange = txsPercentChangeNew
      }
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
            oneDayTxs,
            ethLiquidity: Big(ethBalance).toFixed(4),
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

// build the label for dropdown
const buildDirectoryLabel = exchange => {
  let { tokenSymbol, id, tokenAddress } = exchange
  const exchangeAddress = id

  // custom handling for UI
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

// build object for token page data
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
