import { Container } from 'unstated'
import dayjs from 'dayjs'
import { client } from '../apollo/client'
import { FRONT_PAGE_QUERY, FRONT_PAGE_24HOUR } from '../apollo/queries'

export class FrontPageContainer extends Container {
  state = {
    topTen: [],
    yesterdaysVolume: [],
  }

  async fetchFrontTwenty () {
    try {
      let data = []
      let dataEnd = false
      let skip = 0
      let result = await client.query({
        query: FRONT_PAGE_QUERY,
        variables: {
          first: 50,
        },
        fetchPolicy: 'network-only',
      })
      data = data.concat(result.data.exchanges)

      console.log('TOP TWENTY: ', data)
      console.log(`fetched ${data.length} exchanges ordered by trade volume`)

      await this.setState({
        topTen: data
      })
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
          query: FRONT_PAGE_24HOUR,
          variables: {
            exchangeAddr: addresses[i].id,
            timestamp: utcOneDayBack.unix()
          },
          fetchPolicy: 'network-only',
        })
        if (result) {
          addresses[i].tradeVolumeEth = addresses[i].tradeVolumeEth - result.data.exchangeHistoricalDatas[0].tradeVolumeEth
        }

      }
      addresses.sort(function(a, b){
        return b.tradeVolumeEth -a.tradeVolumeEth
      })
      console.log("updated:", addresses)

      await this.setState({
        topTen: addresses
      })

    } catch (err) {
      console.log('error: ', err)
    }
  }
}