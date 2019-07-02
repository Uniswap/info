import { Container } from 'unstated'
import dayjs from 'dayjs'
import { client } from '../apollo/client'
import { OVERVIEW_PAGE_QUERY, OVERVIEW_PAGE_24HOUR, TOTALS_QUERY } from '../apollo/queries'

export class OverviewPageContainer extends Container {
  state = {
    topN: [],
    totals: {}
  }

  async fetchTotals() {
    try {
      let result = await client.query({
        query: TOTALS_QUERY,
        fetchPolicy: 'network-only'
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
          first: numberOfExchanges
        },
        fetchPolicy: 'network-only'
      })
      data = data.concat(result.data.exchanges)

      console.log(`fetched ${data.length} exchanges ordered by trade volume`)

      await this.fetchYesterdaysVolume(data)
    } catch (err) {
      console.log('error: ', err)
    }
  }

  // fetch exchange information for each token
  async fetchYesterdaysVolume(addresses) {
    try {
      const utcCurrentTime = dayjs()
      const utcOneDayBack = utcCurrentTime.subtract(1, 'day')
      // for each token...
      const historicalVolumes = await Promise.all(
        addresses.map(address =>
          client.query({
            query: OVERVIEW_PAGE_24HOUR,
            variables: {
              tokenAddress: address.tokenAddress,
              timestamp: utcOneDayBack.unix()
            },
            fetchPolicy: 'network-only'
          })
        )
      )

      for (let i = 0; i < addresses.length; i++) {
        if (addresses[i].tokenName === null || addresses[i].tokenName === 'unknown' || addresses[i].tokenName === ' ') {
          addresses[i].tokenName = addresses[i].tokenAddress
        }

        if (historicalVolumes[i]) {
          addresses[i].tradeVolumeEth = (
            addresses[i].tradeVolumeEth - historicalVolumes[i].data.exchangeHistoricalDatas[0].tradeVolumeEth
          ).toFixed(4)
        }
      }

      addresses.sort((a, b) => b.tradeVolumeEth - a.tradeVolumeEth)
      console.log(`fetched ${addresses.length} exchanges 24 hour trade volume`)

      await this.setState({
        topN: addresses
      })
    } catch (err) {
      console.log('error: ', err)
    }
  }
}
