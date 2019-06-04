import { Container } from 'unstated'
import dayjs from 'dayjs'
import { client } from '../apollo/client'
import { OVERVIEW_PAGE_QUERY, OVERVIEW_PAGE_24HOUR, TOTALS_QUERY } from '../apollo/queries'

export class OverviewPageContainer extends Container {
  state = {
    topTen: [],
    totals: {},
  }

  async fetchTotals () {
    try {
      let data = []
      let result = await client.query({
        query: TOTALS_QUERY,
        fetchPolicy: 'network-only',
      })

      console.log(`fetched uniswap total data`)
      //
      await this.setState({
        totals: result.data.uniswap
      })

    } catch (err) {
      console.log('error: ', err)
    }
  }

  async fetchExchanges(numberOfExchanges) {
    try {
      let data = []
      let result = await client.query({
        query: OVERVIEW_PAGE_QUERY,
        variables: {
          first: numberOfExchanges,
        },
        fetchPolicy: 'network-only',
      })
      data = data.concat(result.data.exchanges)

      console.log(`fetched ${data.length} exchanges ordered by trade volume`)

      await this.fetchYesterdaysVolume(data)

    } catch (err) {
      console.log('error: ', err)
    }
  }

  // fetch exchange information via address
  async fetchYesterdaysVolume (addresses) {
    try {
      const utcCurrentTime = dayjs()
      const utcOneDayBack = utcCurrentTime.subtract(1, 'day')
      for (let i = 0; i < addresses.length; i++) {
        const result = await client.query({
          query: OVERVIEW_PAGE_24HOUR,
          variables: {
            exchangeAddr: addresses[i].id,
            timestamp: utcOneDayBack.unix()
          },
          fetchPolicy: 'network-only',
        })
        if (result) {
          addresses[i].tradeVolumeEth = (addresses[i].tradeVolumeEth - result.data.exchangeHistoricalDatas[0].tradeVolumeEth).toFixed(4)
        }

      }
      addresses.sort(function (a, b) {
        return b.tradeVolumeEth - a.tradeVolumeEth
      })
      console.log(`fetched ${addresses.length} exchanges 24 hour trade volume`)

      console.log(addresses)
      await this.setState({
        topTen: addresses
      })

    } catch (err) {
      console.log('error: ', err)
    }
  }
}