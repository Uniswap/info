import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { getChangeValues } from '../helpers'
import { client } from '../apollo/client'
import { UNISWAP_GLOBALS_QUERY, UNISWAP_GLOBALS_24HOURS_AGO_QUERY } from '../apollo/queries'

export function useGlobalData() {
  dayjs.extend(utc)
  const [globalData, setGlobalData] = useState()

  useEffect(() => {
    const fetchGlobalData = async function() {
      let data = {}
      let data24HoursAgo = {}
      let data48HoursAgo = {}

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

                // get two day stats

                const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day')

                try {
                  // get the current data
                  let resultTwoDays = await client.query({
                    query: UNISWAP_GLOBALS_24HOURS_AGO_QUERY,
                    variables: {
                      date: utcTwoDaysBack.unix()
                    },
                    fetchPolicy: 'cache-first'
                  })

                  if (resultTwoDays) {
                    // set two day data
                    data48HoursAgo.totalVolumeInEth = resultTwoDays.data.uniswapHistoricalDatas[0].totalVolumeInEth
                    data48HoursAgo.totalVolumeUSD = resultTwoDays.data.uniswapHistoricalDatas[0].totalVolumeUSD
                    data48HoursAgo.liquidityEth = resultTwoDays.data.uniswapHistoricalDatas[0].totalLiquidityInEth
                    data48HoursAgo.liquidityUsd = resultTwoDays.data.uniswapHistoricalDatas[0].totalLiquidityUSD
                    data48HoursAgo.txCount = resultTwoDays.data.uniswapHistoricalDatas[0].txCount

                    // get volume info for both 24 hour periods
                    let [volumeChangeUSD, volumePercentChangeUSD] = getChangeValues(
                      data.totalVolumeUSD,
                      data24HoursAgo.totalVolumeUSD,
                      data48HoursAgo.totalVolumeUSD
                    )

                    let [volumeChangeETH, volumePercentChangeETH] = getChangeValues(
                      data.totalVolumeInEth,
                      data24HoursAgo.totalVolumeInEth,
                      data48HoursAgo.totalVolumeInEth
                    )

                    let [txCountChange, txCountPercentChange] = getChangeValues(
                      data.txCount,
                      data24HoursAgo.txCount,
                      data48HoursAgo.txCount
                    )

                    let liquidityPercentChangeETH = ''
                    const adjustedPriceChangeLiquidity = (
                      ((data.liquidityEth - data24HoursAgo.liquidityEth) / data.liquidityEth) *
                      100
                    ).toFixed(2)
                    adjustedPriceChangeLiquidity > 0
                      ? (liquidityPercentChangeETH = '+')
                      : (liquidityPercentChangeETH = '')
                    liquidityPercentChangeETH += adjustedPriceChangeLiquidity

                    let liquidityPercentChangeUSD = ''
                    const adjustedPriceChangeLiquidityUSD = (
                      ((data.liquidityUsd - data24HoursAgo.liquidityUsd) / data.liquidityUsd) *
                      100
                    ).toFixed(2)
                    adjustedPriceChangeLiquidityUSD > 0
                      ? (liquidityPercentChangeUSD = '+')
                      : (liquidityPercentChangeUSD = '')
                    liquidityPercentChangeUSD += adjustedPriceChangeLiquidityUSD

                    //set the global txCount
                    data.liquidityPercentChange = liquidityPercentChangeETH
                    data.liquidityPercentChangeUSD = liquidityPercentChangeUSD
                    data.volumePercentChange = volumePercentChangeETH
                    data.volumePercentChangeUSD = volumePercentChangeUSD
                    data.txCount = txCountChange
                    data.txCountPercentChange = txCountPercentChange
                    data.dailyVolumeETH = volumeChangeETH
                    data.dailyVolumeUSD = volumeChangeUSD
                  }
                } catch (err) {
                  console.log('error: ', err)
                }
              }
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
