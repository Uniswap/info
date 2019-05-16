import { Container } from 'unstated'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

// import { client } from '../apollo/client'
import { CHART_QUERY } from '../apollo/queries'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'

// TODO - remove this once mainnet is synced up , and use the normal
export const client = new ApolloClient({
  link: new HttpLink({
    uri: 'http://127.0.0.1:8000/subgraphs/name/davekaj/uniswap'
  }),
  cache: new InMemoryCache(),
})


dayjs.extend(utc)

export class ChartContainer extends Container {
  state = {
    data: []
  }

  resetChart = () => this.setState({ data: [] })

  async fetchChart (exchangeAddress, daysToQuery) {
    try {
      // current time
      const utcEndTime = dayjs.utc()

      let utcStartTime
      let unit
      let allTime = false

      // go back, go way way back
      switch (daysToQuery) {
        case 'all':
          utcStartTime = utcEndTime.subtract(1, 'year').startOf('year')
          unit = 'month'
          allTime = true
          break
        case '3months':
          utcStartTime = utcEndTime.subtract(3, 'month').startOf('month')
          unit = 'day'
          break
        case '1month':
          utcStartTime = utcEndTime.subtract(1, 'month').startOf('month')
          unit = 'day'
          break
        case '1week':
        default:
          utcStartTime = utcEndTime.subtract(7, 'day').startOf('day')
          unit = 'day'
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
          fetchPolicy: 'network-only',
        })
        data = data.concat(result.data.exchangeDayDatas)
        if (result.data.exchangeDayDatas.length !== 100) {
          dataEnd = true
        } else {
          startTime = result.data.exchangeDayDatas[99].date - 1
        }
      }
      console.log(data)
      data.forEach((dayData, i) => {
        let dayTimestamp = dayjs.unix(data[i].date)
        // note, the dayjs api says date starts at 1, but it appears it doesnt, as I had to add 1
        let dayString = dayTimestamp.year().toString().concat('-').concat((dayTimestamp.month() + 1).toString()).concat('-').concat((dayTimestamp.date() + 1).toString())
        data[i].date = dayString
      })
      console.log(data)



      await this.setState({
        data: data
      });
    } catch (err) {
      console.log('error: ', err)
    }
  }
}
