import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { get2DayPercentChange, getPercentChange } from '../helpers'
import { v1Client } from '../apollo/client'
import { UNISWAP_GLOBALS_QUERY, UNISWAP_GLOBALS_24HOURS_AGO_QUERY } from '../apollo/queries'

export function useV1Data() {
  dayjs.extend(utc)
  const [globalData, setGlobalData] = useState()

  useEffect(() => {
    const fetchGlobalData = async function() {
      let data = {}
      let data24HoursAgo = {}
      let data48HoursAgo = {}
      const utcCurrentTime = dayjs()
      try {
        // get the current data
        let result = await v1Client.query({
          query: UNISWAP_GLOBALS_QUERY,
          fetchPolicy: 'cache-first'
        })
        if (result) {
          data.totalVolumeInEth = result.data.uniswap.totalVolumeInEth
          data.totalVolumeUSD = result.data.uniswap.totalVolumeUSD
          data.liquidityEth = result.data.uniswap.totalLiquidityInEth
          data.liquidityUsd = result.data.uniswap.totalLiquidityUSD
          data.txCount = result.data.uniswap.txCount
        }
      } catch (err) {
        console.log('error: ', err)
      }

      try {
        const utcOneDayBack = utcCurrentTime.subtract(1, 'day')
        // get data one day ago
        let result = await v1Client.query({
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
        }
      } catch (err) {
        console.log('error: ', err)
      }
      // get two day stats
      const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day')
      try {
        let resultTwoDays = await v1Client.query({
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
        }
      } catch (err) {
        console.log('error: ', err)
      }

      // 48 hour windows
      let [volumeChangeUSD, volumePercentChangeUSD] = get2DayPercentChange(
        data.totalVolumeUSD,
        data24HoursAgo.totalVolumeUSD,
        data48HoursAgo.totalVolumeUSD
      )

      let [volumeChangeETH, volumePercentChangeETH] = get2DayPercentChange(
        data.totalVolumeInEth,
        data24HoursAgo.totalVolumeInEth,
        data48HoursAgo.totalVolumeInEth
      )

      let [txCountChange, txCountPercentChange] = get2DayPercentChange(
        data.txCount,
        data24HoursAgo.txCount,
        data48HoursAgo.txCount
      )

      // regular percent changes
      let liquidityPercentChangeETH = getPercentChange(data.liquidityEth, data24HoursAgo.liquidityEth)
      let liquidityPercentChangeUSD = getPercentChange(data.liquidityUsd, data24HoursAgo.liquidityUsd)

      data.liquidityPercentChange = liquidityPercentChangeETH
      data.liquidityPercentChangeUSD = liquidityPercentChangeUSD
      data.volumePercentChange = volumePercentChangeETH
      data.volumePercentChangeUSD = volumePercentChangeUSD
      data.txCount = txCountChange
      data.txCountPercentChange = txCountPercentChange
      data.dailyVolumeETH = volumeChangeETH
      data.dailyVolumeUSD = volumeChangeUSD

      setGlobalData(data)
      console.log('fetching')
    }

    !globalData && fetchGlobalData()
  }, [globalData])

  return globalData
}
