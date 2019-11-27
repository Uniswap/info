import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import { client } from '../apollo/client'
import { UNISWAP_CHART_QUERY } from '../apollo/queries'

export function useUniswapHistory(daysToQuery) {
  dayjs.extend(utc)
  const [uniswapData, setUniswapData] = useState([])
  useEffect(() => {
    const fetchChartData = async function(daysToQuery) {
      try {
        // current time
        const utcEndTime = dayjs.utc()

        let utcStartTime
        // go back, go way way back
        switch (daysToQuery) {
          case 'all':
            utcStartTime = utcEndTime.subtract(1, 'year').startOf('year')
            break
          case '3months':
            utcStartTime = utcEndTime.subtract(3, 'month')
            break
          case '1month':
            utcStartTime = utcEndTime.subtract(1, 'month')
            break
          case '1week':
          default:
            utcStartTime = utcEndTime.subtract(7, 'day').startOf('day')
            break
        }
        let startTime = utcStartTime.unix() - 1 //because we filter on greater than in the query

        let data = []
        let dataEnd = false
        while (!dataEnd) {
          let result = await client.query({
            query: UNISWAP_CHART_QUERY,
            variables: {
              date: startTime
            },
            fetchPolicy: 'cache-first'
          })
          if (result) {
            data = data.concat(result.data.uniswapDayDatas)
            if (result.data.uniswapDayDatas.length !== 100) {
              dataEnd = true
            } else {
              startTime = result.data.uniswapDayDatas[result.data.uniswapDayDatas.length - 1].date
            }
          }
        }

        /**
         *  Format data for chart
         */
        data.forEach((dayData, i) => {
          data[i].dayString = data[i].date
          data[i].ethVolume = parseFloat(data[i].totalVolumeInEth)
          data[i].usdVolume = parseFloat(data[i].totalVolumeUSD)
          data[i].dailyEthVolume = parseFloat(data[i].dailyVolumeInETH)
          data[i].dailyUSDVolume = parseFloat(data[i].dailyVolumeInUSD)
          data[i].ethLiquidity = parseFloat(data[i].totalLiquidityInEth)
          data[i].usdLiquidity = parseFloat(data[i].totalLiquidityUSD)
          data[i].txCount = parseFloat(data[i].txCount)
        })
        setUniswapData(data) // remove first value
      } catch (err) {
        console.log('error: ', err)
      }
    }
    fetchChartData(daysToQuery)
  }, [daysToQuery])

  return uniswapData
}
