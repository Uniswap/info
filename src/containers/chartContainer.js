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

      console.log((utcStartTime.unix() - 1)/1000)
      let data = []
      let dataEnd = false
      while (!dataEnd) {
        let result = await client.query({
          query: CHART_QUERY,
          variables: {
            exchangeAddr: exchangeAddress,
            date: utcStartTime.unix() - 1 // -1 because we filter on greater than in the query
          },
          fetchPolicy: 'network-only',
        })
        console.log(result)
        if (result.data.exchangeDayDatas.length !== 100) {
          dataEnd = true
        }
      }



      /*
      // If all time we need to run an initial query to figure out when this exchange was created
      // Then get dates from then on
      if (allTime) {
        let initialResult = await client.query({
          query: INITIAL_CHART_QUERY,
          variables: {
            exchangeAddr: exchangeAddress
          },
          fetchPolicy: 'network-only',
        })
        console.log(initialResult.data)
        console.log(dayjs.unix(initialResult.data.exchangeHistories[0].timestamp))
        utcStartTime = dayjs.unix(initialResult.data.exchangeHistories[0].timestamp)
        let utcStartConverted = utcStartTime.year().toString().concat('-').concat((utcStartTime.month() + 1).toString()).concat('-').concat(utcStartTime.date().toString())
        console.log(utcStartConverted)
        let baseDate = dayjs(utcStartConverted).unix()
        console.log(baseDate)
      }
      while (!dataEnd) {
        let loopingResult = await client.query({
          query: LOOPING_CHART_QUERY,
          variables: {
            exchangeAddr: exchangeAddress,
            timestamp: utcStartTime.unix()

          },
          fetchPolicy: 'network-only',
        })
        console.log(loopingResult)
        if (utcStartTime + 86400 > utcEndTime) {
          dataEnd = true
        }
      }
*/
      // console.log(`fetched ${data.length} exchange history points for chart`)

      // await this.setState({
      //   data: data
      // });
    } catch (err) {
      console.log('error: ', err)
    }
  }
}
