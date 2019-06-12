import React from 'react'
import ReactDOM from 'react-dom'
import { Subscribe, Provider } from 'unstated'

import { PoolContainer } from './containers/poolContainer'
import { DirectoryContainer } from './containers/directoryContainer'
import { TransactionsContainer } from './containers/transactionsContainer'
import { ChartContainer } from './containers/chartContainer'
import { OverviewPageContainer } from './containers/overviewPageContainer'
import App from './App'

export default function AppWrapper() {
  return (
    <Provider>
      <Subscribe to={[PoolContainer, TransactionsContainer, DirectoryContainer, ChartContainer, OverviewPageContainer]}>
        {(poolStore, transactionsStore, directoryStore, chartStore, overviewPageStore) => (
          <App
            poolStore={poolStore}
            transactionsStore={transactionsStore}
            directoryStore={directoryStore}
            chartStore={chartStore}
            overviewPageStore={overviewPageStore}
          />
        )}
      </Subscribe>
    </Provider>
  )
}

ReactDOM.render(<AppWrapper />, document.getElementById('root'))
