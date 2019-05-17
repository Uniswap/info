import { Container } from 'unstated'
import dayjs from "dayjs";
import { Big } from '../helpers'
import { client } from '../apollo/client'
import { DIRECTORY_QUERY, TICKER_QUERY, TICKER_24HOUR_QUERY } from '../apollo/queries'

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
      }
      const {
        price,
        ethBalance,
        tokenBalance,
        tradeVolumeEth,
      } = data

      let data24HoursAgo
      try {
        const utcCurrentTime = dayjs()
        const utcOneDayBack = utcCurrentTime.subtract(1, "day")
        const result24HoursAgo = await client.query({
          query: TICKER_24HOUR_QUERY,
          variables: {
            exchangeAddr: address,
            timestamp: utcOneDayBack.unix()
          },
          fetchPolicy: 'network-only',
        })
        if (result24HoursAgo) {
          data24HoursAgo = result24HoursAgo.data.exchangeHistoricalDatas[0]
        }
      } catch (err) {
        console.log('error: ', err)
      }
      const invPrice = 1 / price

      let percentChange = ''
      const adjustedPriceChangePercent = ((price - data24HoursAgo.price) /price * 100).toFixed(2)
      adjustedPriceChangePercent > 0
        ? (percentChange = '+')
        : (percentChange = '')

      percentChange += adjustedPriceChangePercent

      let oneDayVolume = tradeVolumeEth - data24HoursAgo.tradeVolumeEth

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
            tradeVolume: Big(oneDayVolume).toFixed(4),
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
  } = exchange

  const exchangeAddress = id
  const symbol = tokenSymbol
  let theme = hardcodeThemes[exchangeAddress]
  if (theme == undefined){
    theme = ""
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
  "0x2c4bd064b998838076fa341a83d007fc2fa50957": "#1abc9c",
  "0xae76c84c9262cdb9abc0c2c8888e62db8e22a0bf": "#302c2c",
  "0x09cabec1ead1c0ba254b09efb3ee13841712be14": "#fdc134",
  "0x4e395304655f0796bc3bc63709db72173b9ddf98": "#00b4f4",
  "0x2e642b8d59b45a1d8c5aef716a84ff44ea665914": "#ff5000",
}
