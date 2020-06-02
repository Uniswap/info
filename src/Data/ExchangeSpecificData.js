import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { client } from '../apollo/client'
import { TICKER_QUERY, TICKER_24HOUR_QUERY } from '../apollo/queries'
import { get2DayPercentFormatted, getPercentFormatted } from '../helpers'
import { useEthPriceUSD } from '../contexts/Application'

export function useExchangeSpecificData(exchangeAddress) {
  dayjs.extend(utc)

  const [exchangeData, setExchangeData] = useState({})

  const ethPrice = useEthPriceUSD()

  useEffect(() => {
    const fetchExchangeData = async function(address) {
      const utcCurrentTime = dayjs()
      let data24HoursAgo = {}
      let data48HoursAgo = {}
      let data = {}
      let newExchangeData = {}
      // get the current state of the exchange
      const result = await client.query({
        query: TICKER_QUERY,
        variables: {
          id: address
        },
        fetchPolicy: 'network-only'
      })

      if (result) {
        data = result.data.exchange
      }

      let {
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
          fetchPolicy: 'network-only'
        })
        if (result24HoursAgo) {
          data24HoursAgo = result24HoursAgo.data.exchangeHistoricalDatas[0]
            ? result24HoursAgo.data.exchangeHistoricalDatas[0]
            : data24HoursAgo
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
          fetchPolicy: 'network-only'
        })
        if (result48HoursAgo) {
          data48HoursAgo = result48HoursAgo.data.exchangeHistoricalDatas[0]
            ? result48HoursAgo.data.exchangeHistoricalDatas[0]
            : data48HoursAgo
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

      if (data) {
        // volume in ETH
        ;[oneDayVolume, volumePercentChangeETH] = get2DayPercentFormatted(
          tradeVolumeEth,
          data24HoursAgo.tradeVolumeEth ? data24HoursAgo.tradeVolumeEth : 0,
          data48HoursAgo.tradeVolumeEth ? data48HoursAgo.tradeVolumeEth : 0
        )

        // until updated graph with correct USD accumulation
        ;[oneDayVolumeUSD, volumePercentChangeUSD] = get2DayPercentFormatted(
          tradeVolumeUSD,
          data24HoursAgo.tradeVolumeUSD ? data24HoursAgo.tradeVolumeUSD : 0,
          data48HoursAgo.tradeVolumeUSD ? data48HoursAgo.tradeVolumeUSD : 0
        )

        // get tx values
        ;[oneDayTxs, txsPercentChange] = get2DayPercentFormatted(
          totalTxsCount,
          data24HoursAgo.totalTxsCount ? data24HoursAgo.totalTxsCount : 1, //account for initial add tx
          data48HoursAgo.totalTxsCount ? data48HoursAgo.totalTxsCount : 1
        )

        // regular percentage changes
        pricePercentChangeUSD = getPercentFormatted(priceUSD, data24HoursAgo.tokenPriceUSD)
        pricePercentChangeETH = getPercentFormatted(1 / price, 1 / data24HoursAgo.price)
        liquidityPercentChangeETH = getPercentFormatted(ethBalance, data24HoursAgo.ethBalance)
        liquidityPercentChangeUSD = getPercentFormatted(
          ethBalance * price * priceUSD,
          data24HoursAgo.ethBalance * data24HoursAgo.price * data24HoursAgo.tokenPriceUSD
        )
      }

      // manual overrides
      if (tokenAddress === '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359') {
        tokenSymbol = 'SAI'
      }

      if (tokenAddress === '0xf5dce57282a584d2746faf1593d3121fcac444dc') {
        tokenSymbol = 'cSAI'
        tokenName = 'Compound Sai'
      }

      // update "exchanges" with new information
      newExchangeData.tokenName = tokenName
      newExchangeData.tokenSymbol = tokenSymbol
      newExchangeData.tokenAddress = tokenAddress
      newExchangeData.price = price
      newExchangeData.invPrice = invPrice
      newExchangeData.priceUSD = invPrice * ethPrice
      newExchangeData.pricePercentChange = pricePercentChangeUSD
      newExchangeData.pricePercentChangeETH = pricePercentChangeETH
      newExchangeData.volumePercentChangeETH = volumePercentChangeETH
      newExchangeData.volumePercentChangeUSD = volumePercentChangeUSD
      newExchangeData.liquidityPercentChangeETH = liquidityPercentChangeETH
      newExchangeData.liquidityPercentChangeUSD = liquidityPercentChangeUSD
      newExchangeData.tradeVolume = oneDayVolume
      newExchangeData.tradeVolumeUSD = oneDayVolumeUSD
      newExchangeData.oneDayTxs = oneDayTxs
      newExchangeData.ethLiquidity = ethBalance
      newExchangeData.txsPercentChange = txsPercentChange

      setExchangeData(newExchangeData)
    }
    if (ethPrice) {
      fetchExchangeData(exchangeAddress)
    }
  }, [exchangeAddress, ethPrice])

  return exchangeData
}
