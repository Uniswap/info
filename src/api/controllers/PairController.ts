import ApiService from 'api/ApiService'
import { FILTERED_TRANSACTIONS } from 'apollo/queries'
import { SupportedNetwork } from 'constants/networks'

class PairController {
  public getFilteredTransactions(pairAddress: string) {
    switch (ApiService.activeNetwork) {
      case SupportedNetwork.ETHEREUM:
        return ApiService.graphQlApi.query({
          query: FILTERED_TRANSACTIONS,
          variables: {
            allPairs: [pairAddress]
          },
          fetchPolicy: 'no-cache'
        })
      case SupportedNetwork.TRON:
        return ApiService.restApi.get('/filter/transactions')
    }
  }
}

export default PairController
