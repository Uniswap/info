import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import { client } from '../apollo/client'
import { CHART_QUERY, TICKER_QUERY } from '../apollo/queries'

export function useChart(exchangeAddress, daysToQuery) {
  dayjs.extend(utc)

  const [chartData, setChartData] = useState([])

  const [monthlyData, setMonthlyData] = useState([])
  const [weeklyData, setWeeklyData] = useState([])

  useEffect(() => {
    const fetchChartData = async function(exchangeAddress, daysToQuery) {
      try {
        const utcEndTime = dayjs.utc()
        let utcStartTime
        switch (daysToQuery) {
          case 'all':
            utcStartTime = utcEndTime.subtract(2, 'year').startOf('year')
            break
          case '1year':
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
        let startTime = utcStartTime.unix() - 1 // -1 because we filter on greater than in the query
        let data = []
        let dataEnd = false
        while (!dataEnd) {
          let result = await client.query({
            query: CHART_QUERY,
            variables: {
              exchangeAddr: exchangeAddress,
              date: startTime
            },
            fetchPolicy: 'cache-first'
          })
          data = data.concat(result.data.exchangeDayDatas)
          if (result.data.exchangeDayDatas.length !== 100) {
            dataEnd = true
          } else {
            startTime = result.data.exchangeDayDatas[result.data.exchangeDayDatas.length - 1].date
          }
        }

        // if no txs in the current timestamp ut must be most current
        if (!data[0]) {
          const result = await client.query({
            query: TICKER_QUERY,
            variables: {
              id: exchangeAddress
            },
            fetchPolicy: 'network-only'
          })
          if (result) {
            data[0] = result.data.exchange
            data[0].date = startTime
            data[0].marginalEthRate = data[0].price
            data[0].tokenPriceUSD = data[0].priceUSD
          }
        }
        // use to keep track of which days had volume
        let dayIndexSet = new Set()
        let dayIndexArray = []
        const oneDay = 24 * 60 * 60
        data.forEach((dayData, i) => {
          // add the day index to the set of days
          dayIndexSet.add((data[i].date / oneDay).toFixed(0))
          dayIndexArray.push(data[i])
          data[i].dayString = data[i].date
          let ethVolume = data[i].ethVolume
          let ethPriceUsd = parseFloat(data[i].marginalEthRate) * parseFloat(data[i].tokenPriceUSD)
          data[i].ethVolume = parseFloat(ethVolume)
          data[i].tokenPriceUSD = parseFloat(data[i].tokenPriceUSD)
          data[i].tokensPerUSD = 1 / parseFloat(data[i].tokenPriceUSD)
          data[i].usdVolume = parseFloat(ethVolume) * ethPriceUsd
          data[i].ethPerToken = 1 / parseFloat(data[i].marginalEthRate)
          data[i].tokensPerEth = parseFloat(data[i].marginalEthRate)
          let y = data[i].ethBalance
          data[i].ethBalance = parseFloat(y)
          data[i].tokenBalance = parseFloat(data[i].tokenBalance)
          data[i].usdLiquidity =
            parseFloat(data[i].tokenBalance) * parseFloat(data[i].tokenPriceUSD) +
            parseFloat(data[i].ethBalance) * ethPriceUsd
          data[i].ethLiquidity = parseFloat(data[i].ethBalance) * 2
        })
        // fill in empty days
        let timestamp = data[0].date ? data[0].date : startTime
        let latestLiquidityUSD = data[0].usdLiquidity
        let latestLiquidityETH = data[0].ethLiquidity
        let latestEthBalance = data[0].ethBalance
        let latestTokenBalance = data[0].tokenBalance
        let latestEthPerToken = data[0].ethPerToken
        let latestTokenPriceUSD = data[0].tokenPriceUSD
        let latestTokensPerUSD = data[0].tokensPerUSD
        let latestTokensPerETH = data[0].tokensPerEth
        let index = 1
        while (timestamp < utcEndTime.unix() - oneDay) {
          const nextDay = timestamp + oneDay
          let currentDayIndex = (nextDay / oneDay).toFixed(0)
          if (!dayIndexSet.has(currentDayIndex)) {
            data.push({
              date: nextDay,
              dayString: nextDay,
              ethVolume: 0,
              usdVolume: 0,
              usdLiquidity: latestLiquidityUSD,
              ethLiquidity: latestLiquidityETH,
              ethBalance: latestEthBalance,
              tokenBalance: latestTokenBalance,
              tokenPriceUSD: latestTokenPriceUSD,
              ethPerToken: latestEthPerToken,
              tokensPerUSD: latestTokensPerUSD,
              tokensPerEth: latestTokensPerETH
            })
          } else {
            latestLiquidityUSD = dayIndexArray[index].usdLiquidity
            latestLiquidityETH = dayIndexArray[index].ethLiquidity
            latestEthBalance = dayIndexArray[index].ethBalance
            latestTokenBalance = dayIndexArray[index].tokenBalance
            latestEthPerToken = dayIndexArray[index].ethPerToken
            latestTokenPriceUSD = dayIndexArray[index].tokenPriceUSD
            latestTokensPerUSD = dayIndexArray[index].tokensPerUSD
            latestTokensPerETH = dayIndexArray[index].tokensPerEth
            index = index + 1
          }
          timestamp = nextDay
        }
        data = data.sort((a, b) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1))
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
              ? monthlyData[startIndex].monthlyVolumeETH + data[i].ethVolume
              : data[i].ethVolume
            monthlyData[startIndex].monthlyVolumeUSD = monthlyData[startIndex].monthlyVolumeUSD
              ? monthlyData[startIndex].monthlyVolumeUSD + data[i].usdVolume
              : data[i].usdVolume
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
              ? weeklyData[startIndexWeekly].weeklyVolumeETH + data[i].ethVolume
              : data[i].ethVolume
            weeklyData[startIndexWeekly].weeklyVolumeUSD = weeklyData[startIndexWeekly].weeklyVolumeUSD
              ? weeklyData[startIndexWeekly].weeklyVolumeUSD + data[i].usdVolume
              : data[i].usdVolume
          })
        }

        setWeeklyData(weeklyData)
        setMonthlyData(monthlyData)
        setChartData(data)
      } catch (err) {
        console.log('error: ', err)
      }
    }
    fetchChartData(exchangeAddress, daysToQuery)
  }, [exchangeAddress, daysToQuery])

  return [chartData, monthlyData, weeklyData]
}
