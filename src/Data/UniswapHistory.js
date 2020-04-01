import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import weekOfYear from 'dayjs/plugin/weekOfYear'

import { client } from '../apollo/client'
import { UNISWAP_CHART_QUERY } from '../apollo/queries'

export function useUniswapHistory(daysToQuery) {
  dayjs.extend(utc)
  dayjs.extend(weekOfYear)

  const [uniswapData, setUniswapData] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [weeklyData, setWeeklyData] = useState([])

  useEffect(() => {
    const fetchChartData = async function(daysToQuery) {
      try {
        // current time
        const utcEndTime = dayjs.utc()

        let utcStartTime
        // go back, go way way back
        switch (daysToQuery) {
          case 'all':
            utcStartTime = utcEndTime.subtract(2, 'year').startOf('year')
            break
          case '1year':
            utcStartTime = utcEndTime.subtract(1, 'year')
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

        // mothly fetching
        const fetchMonthly = true
        const monthlyData = []
        let startIndex = -1
        let currentMonth = -1
        if (fetchMonthly) {
          data.forEach((dayData, i) => {
            const month = dayjs.utc(dayjs.unix(data[i].date)).month()
            if (month !== currentMonth) {
              currentMonth = month
              startIndex++
            }
            monthlyData[startIndex] = monthlyData[startIndex] || {}
            monthlyData[startIndex].dayString = data[i].date
            monthlyData[startIndex].monthlyVolumeETH = monthlyData[startIndex].monthlyVolumeETH
              ? monthlyData[startIndex].monthlyVolumeETH + data[i].dailyEthVolume
              : data[i].dailyEthVolume
            monthlyData[startIndex].monthlyVolumeUSD = monthlyData[startIndex].monthlyVolumeUSD
              ? monthlyData[startIndex].monthlyVolumeUSD + data[i].dailyUSDVolume
              : data[i].dailyUSDVolume
          })
        }

        // mothly fetching
        const fetchWeekly = true
        const weeklyData = []
        let startIndexWeekly = -1
        let currentWeek = -1
        if (fetchWeekly) {
          data.forEach((dayData, i) => {
            const week = dayjs.utc(dayjs.unix(data[i].date)).week()
            if (week !== currentWeek) {
              currentWeek = week
              startIndexWeekly++
            }
            weeklyData[startIndexWeekly] = weeklyData[startIndexWeekly] || {}
            weeklyData[startIndexWeekly].dayString = data[i].date
            weeklyData[startIndexWeekly].weeklyVolumeETH = weeklyData[startIndexWeekly].weeklyVolumeETH
              ? weeklyData[startIndexWeekly].weeklyVolumeETH + data[i].dailyEthVolume
              : data[i].dailyEthVolume
            weeklyData[startIndexWeekly].weeklyVolumeUSD = weeklyData[startIndexWeekly].weeklyVolumeUSD
              ? weeklyData[startIndexWeekly].weeklyVolumeUSD + data[i].dailyUSDVolume
              : data[i].dailyUSDVolume
          })
        }
        setWeeklyData(weeklyData)
        setMonthlyData(monthlyData)
        setUniswapData(data)
      } catch (err) {
        console.log('error: ', err)
      }
    }
    fetchChartData(daysToQuery)
  }, [daysToQuery])

  return [uniswapData, monthlyData, weeklyData]
}
