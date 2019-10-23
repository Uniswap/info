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
            fetchPolicy: 'network-only'
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
              // const utcCurrentTime = dayjs()
              const utcCurrentTime = dayjs('2019-06-25')
              const utcOneDayBack = utcCurrentTime.subtract(1, 'day')
              let dataEnd = false

              // get the current data
              while (!dataEnd) {
                let result = await client.query({
                  query: UNISWAP_GLOBALS_24HOURS_AGO_QUERY,
                  variables: {
                    date: utcOneDayBack.unix()
                  },
                  fetchPolicy: 'network-only'
                })
                if (result) {
                  data24HoursAgo.totalVolumeInEth = result.data.uniswapDayDatas[0].totalVolumeInEth
                  data24HoursAgo.totalVolumeUSD = result.data.uniswapDayDatas[0].totalVolumeUSD
                  data24HoursAgo.liquidityEth = result.data.uniswapDayDatas[0].totalLiquidityInEth
                  data24HoursAgo.liquidityUsd = result.data.uniswapDayDatas[0].totalLiquidityUSD
                  data24HoursAgo.txCount = result.data.uniswapDayDatas[0].txCount
                  dataEnd = true

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

                  let volumePercentChange = ''
                  const adjustedVolumeChange = (
                    ((data.totalVolumeInEth - data24HoursAgo.totalVolumeInEth) / data.totalVolumeInEth) *
                    100
                  ).toFixed(2)
                  adjustedVolumeChange > 0 ? (volumePercentChange = '+') : (volumePercentChange = '')
                  volumePercentChange += adjustedVolumeChange

                  //set the global txCount
                  data.liquidityPercentChange = liquidityPercentChange
                  data.txCount = data.txCount - data24HoursAgo.txCount
                  data.dailyVolumeETH = data.totalVolumeInEth - data24HoursAgo.totalVolumeInEth
                  data.dailyVolumeUSD = data.totalVolumeUSD - data24HoursAgo.totalVolumeUSD
                  data.volumePercentChange = volumePercentChange
                }
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
