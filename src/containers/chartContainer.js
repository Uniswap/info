import { Container } from 'unstated'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import { client } from '../apollo/client'
import { CHART_QUERY } from '../apollo/queries'

dayjs.extend(utc)

export class ChartContainer extends Container {
  state = {
    data: null
  }

  resetChart = () => this.setState({ data: [] })

  async fetchChart(exchangeAddress, daysToQuery) {
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
          utcStartTime = utcEndTime.subtract(3, 'month').startOf('month')
          break
        case '1month':
          utcStartTime = utcEndTime.subtract(1, 'month').startOf('month')
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
          fetchPolicy: 'network-only'
        })
        data = data.concat(result.data.exchangeDayDatas)
        if (result.data.exchangeDayDatas.length !== 100) {
          dataEnd = true
        } else {
          startTime = result.data.exchangeDayDatas[99].date - 1
        }
      }
      // access to the following
      // date
      // ethBalance
      // tokenBalance
      // marginalEthRate
      // ethVolume
      // ROI
      // tokenPriceUSD
      // totalEvents
      data.forEach((dayData, i) => {
        let dayTimestamp = dayjs.unix(data[i].date)
        // note, the dayjs api says date starts at 1, but it appears it doesnt, as I had to add 1
        let dayString = dayTimestamp
          .year()
          .toString()
          .concat('-')
          .concat((dayTimestamp.month() + 1).toString())
          .concat('-')
          .concat((dayTimestamp.date() + 1).toString())
        data[i].dayString = dayString
        let x = data[i].ethVolume
        let ethPriceUsd = parseFloat(data[i].marginalEthRate) * parseFloat(data[i].tokenPriceUSD)
        data[i].ethVolume = parseFloat(x)
        data[i].usdVolume = parseFloat(x) * ethPriceUsd
        let y = data[i].ethBalance
        data[i].ethBalance = parseFloat(y)
        data[i].tokenBalance = parseFloat(data[i].tokenBalance)
        data[i].usdLiquidity =
          parseFloat(data[i].tokenBalance) * parseFloat(data[i].tokenPriceUSD) +
          parseFloat(data[i].ethBalance) * ethPriceUsd
        data[i].ethLiquidity = parseFloat(data[i].ethBalance) * 2
      })
      // console.log(`fetched ${data.length} days worth of chart data`)

      await this.setState({
        data: data
      })
      return data
    } catch (err) {
      console.log('error: ', err)
    }
  }
}
