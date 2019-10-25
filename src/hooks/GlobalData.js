import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import { client } from '../apollo/client'
import { UNISWAP_GLOBALS_QUERY, UNISWAP_GLOBALS_24HOURS_AGO_QUERY } from '../apollo/queries'

export function useGlobalData() {
  dayjs.extend(utc)
  const [globalData, setGlobalData] = useState()

  useEffect(() => {
    const fetchGlobalData = async function() {
      let data = {}
      let data24HoursAgo = {}

      /**
       * 1. Get today's data
       */
      try {
        let dataEnd = false

        // get the current data
        while (!dataEnd) {
          let result = await client.query({
            query: UNISWAP_GLOBALS_QUERY,
            fetchPolicy: 'cache-first'
          })
          if (result) {
            data.totalVolumeInEth = result.data.uniswap.totalVolumeInEth
            data.totalVolumeUSD = result.data.uniswap.totalVolumeUSD
            data.liquidityEth = result.data.uniswap.totalLiquidityInEth
            data.liquidityUsd = result.data.uniswap.totalLiquidityUSD
            data.txCount = result.data.uniswap.txCount
            dataEnd = true

            /**
             *
             * 2. If done, get the data from a day ago
             */
            try {
              // current time
              const utcCurrentTime = dayjs()
              const utcOneDayBack = utcCurrentTime.subtract(1, 'day')

              // get the current data
              let result = await client.query({
                query: UNISWAP_GLOBALS_24HOURS_AGO_QUERY,
                variables: {
                  date: utcOneDayBack.unix()
                },
                fetchPolicy: 'cache-first'
              })
              if (result) {
                data24HoursAgo.totalVolumeInEth = result.data.uniswapHistoricalDatas[0].totalVolumeInEth
                data24HoursAgo.totalVolumeUSD = result.data.uniswapHistoricalDatas[0].totalVolumeUSD
                data24HoursAgo.liquidityEth = result.data.uniswapHistoricalDatas[0].totalLiquidityInEth
                data24HoursAgo.liquidityUsd = result.data.uniswapHistoricalDatas[0].totalLiquidityUSD
                data24HoursAgo.txCount = result.data.uniswapHistoricalDatas[0].txCount

                let txPercentChange = ''
                const adjustedTxChange = (((data.txCount - data24HoursAgo.txCount) / data.txCount) * 100).toFixed(2)
                adjustedTxChange > 0 ? (txPercentChange = '+') : (txPercentChange = '')
                txPercentChange += adjustedTxChange
                data.txPercentChange = txPercentChange

                let liquidityPercentChange = ''
                const adjustedPriceChangeLiquidity = (
                  ((data.liquidityEth - data24HoursAgo.liquidityEth) / data.liquidityEth) *
                  100
                ).toFixed(2)
                adjustedPriceChangeLiquidity > 0 ? (liquidityPercentChange = '+') : (liquidityPercentChange = '')
                liquidityPercentChange += adjustedPriceChangeLiquidity

                let liquidityPercentChangeUSD = ''
                const adjustedPriceChangeLiquidityUSD = (
                  ((data.liquidityUsd - data24HoursAgo.liquidityUsd) / data.liquidityUsd) *
                  100
                ).toFixed(2)
                adjustedPriceChangeLiquidityUSD > 0
                  ? (liquidityPercentChangeUSD = '+')
                  : (liquidityPercentChangeUSD = '')
                liquidityPercentChangeUSD += adjustedPriceChangeLiquidityUSD

                let volumePercentChange = ''
                const adjustedVolumeChange = (
                  ((data.totalVolumeInEth - data24HoursAgo.totalVolumeInEth) / data.totalVolumeInEth) *
                  100
                ).toFixed(2)
                adjustedVolumeChange > 0 ? (volumePercentChange = '+') : (volumePercentChange = '')
                volumePercentChange += adjustedVolumeChange

                let volumePercentChangeUSD = ''
                const adjustedVolumeChangeUSD = (
                  ((data.totalVolumeUSD - data24HoursAgo.totalVolumeUSD) / data.totalVolumeUSD) *
                  100
                ).toFixed(2)
                adjustedVolumeChangeUSD > 0 ? (volumePercentChangeUSD = '+') : (volumePercentChangeUSD = '')
                volumePercentChangeUSD += adjustedVolumeChangeUSD

                //set the global txCount
                data.liquidityPercentChange = liquidityPercentChange
                data.liquidityPercentChangeUSD = liquidityPercentChangeUSD
                data.volumePercentChange = volumePercentChange
                data.volumePercentChangeUSD = volumePercentChangeUSD
                data.txCount = data.txCount - data24HoursAgo.txCount
                data.dailyVolumeETH = data.totalVolumeInEth - data24HoursAgo.totalVolumeInEth
                data.dailyVolumeUSD = data.totalVolumeUSD - data24HoursAgo.totalVolumeUSD
              }

              // setGlobalData(data)
            } catch (err) {
              console.log('error: ', err)
            }
          }
        }
        setGlobalData(data)
      } catch (err) {
        console.log('error: ', err)
      }
    }
    fetchGlobalData()
  }, [])

  return globalData
}
