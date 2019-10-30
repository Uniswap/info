import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { client } from '../apollo/client'
import { TICKER_QUERY, TICKER_24HOUR_QUERY } from '../apollo/queries'
import { get2DayPercentFormatted, getPercentFormatted, Big } from '../helpers'

export function useExchangeSpecificData(exchangeAddress) {
  dayjs.extend(utc)

  const [exchangeData, setExchangeData] = useState({})

  useEffect(() => {
    const fetchExchangeData = async function(address) {
      const utcCurrentTime = dayjs('06-10-2019')
      let data24HoursAgo = {}
      let data48HoursAgo = {}
      let data = {}
      let newExchangeData = {}
      // get the current state of the exchange
      try {
        const result = await client.query({
          query: TICKER_QUERY,
          variables: {
            id: address
          },
          fetchPolicy: 'cache-first'
        })
        if (result) {
          data = result.data.exchange
        }
      } catch (err) {
        console.log('error: ', err)
      }

      const {
        tokenName,
        tokenSymbol,
        tokenAddress,
        price,
        ethBalance,
        tradeVolumeEth,
        tradeVolumeUSD,
        priceUSD,
        totalTxsCount
      } = data

      // get data from 24 hours ago
      try {
        const utcOneDayBack = utcCurrentTime.subtract(1, 'day')
        const result24HoursAgo = await client.query({
          query: TICKER_24HOUR_QUERY,
          variables: {
            exchangeAddr: address,
            timestamp: utcOneDayBack.unix()
          },
          fetchPolicy: 'cache-first'
        })
        if (result24HoursAgo) {
          data24HoursAgo = result24HoursAgo.data.exchangeHistoricalDatas[0]
        }
      } catch (err) {
        console.log('error: ', err)
      }

      // get data from 48 hours ago
      try {
        const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day')
        const result48HoursAgo = await client.query({
          query: TICKER_24HOUR_QUERY,
          variables: {
            exchangeAddr: address,
            timestamp: utcTwoDaysBack.unix()
          },
          fetchPolicy: 'cache-first'
        })
        if (result48HoursAgo) {
          data48HoursAgo = result48HoursAgo.data.exchangeHistoricalDatas[0]
        }
      } catch (err) {
        console.log('error: ', err)
      }

      // set default values to 0 (for exchanges that are brand new and dont have 24 hour data yet)
      const invPrice = 1 / price
      let pricePercentChangeUSD = 0
      let pricePercentChangeETH = 0
      let volumePercentChangeETH = 0
      let volumePercentChangeUSD = 0
      let liquidityPercentChangeETH = 0
      let liquidityPercentChangeUSD = 0
      let txsPercentChange = 0
      let oneDayTxs = 0
      let oneDayVolume = 0
      let oneDayVolumeUSD = 0

      if (data && data24HoursAgo && data48HoursAgo) {
        // volume in ETH
        ;[oneDayVolume, volumePercentChangeETH] = get2DayPercentFormatted(
          tradeVolumeEth,
          data24HoursAgo.tradeVolumeEth,
          data48HoursAgo.tradeVolumeEth
        )

        // volume in USD
        ;[oneDayVolumeUSD, volumePercentChangeUSD] = get2DayPercentFormatted(
          tradeVolumeUSD,
          data24HoursAgo.tradeVolumeUSD,
          data48HoursAgo.tradeVolumeUSD
        )

        // get tx values
        ;[oneDayTxs, txsPercentChange] = get2DayPercentFormatted(
          totalTxsCount,
          data24HoursAgo.totalTxsCount,
          data48HoursAgo.totalTxsCount
        )

        // regular percentage changes
        pricePercentChangeUSD = getPercentFormatted(priceUSD, data24HoursAgo.tokenPriceUSD)
        pricePercentChangeETH = getPercentFormatted(price, data24HoursAgo.price)
        liquidityPercentChangeETH = getPercentFormatted(ethBalance, data24HoursAgo.ethBalance)
        liquidityPercentChangeUSD = getPercentFormatted(
          ethBalance * price * priceUSD,
          data24HoursAgo.ethBalance * data24HoursAgo.price * data24HoursAgo.tokenPriceUSD
        )
      }
      // update "exchanges" with new information
      newExchangeData.tokenName = tokenName
      newExchangeData.tokenSymbol = tokenSymbol
      newExchangeData.tokenAddress = tokenAddress
      newExchangeData.price = price
      newExchangeData.invPrice = invPrice
      newExchangeData.priceUSD = priceUSD
      newExchangeData.pricePercentChange = pricePercentChangeUSD
      newExchangeData.pricePercentChangeETH = pricePercentChangeETH
      newExchangeData.volumePercentChangeETH = volumePercentChangeETH
      newExchangeData.volumePercentChangeUSD = volumePercentChangeUSD
      newExchangeData.liquidityPercentChangeETH = liquidityPercentChangeETH
      newExchangeData.liquidityPercentChangeUSD = liquidityPercentChangeUSD
      newExchangeData.tradeVolume = parseFloat(Big(oneDayVolume).toFixed(4))
      newExchangeData.tradeVolumeUSD = parseFloat(Big(oneDayVolumeUSD).toFixed(4))
      newExchangeData.oneDayTxs = oneDayTxs
      newExchangeData.ethLiquidity = Big(ethBalance).toFixed(4)
      newExchangeData.txsPercentChange = txsPercentChange

      setExchangeData(newExchangeData)
    }
    fetchExchangeData(exchangeAddress)
  }, [exchangeAddress])

  return exchangeData
}
