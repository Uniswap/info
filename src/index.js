import React from 'react'
import ReactDOM from 'react-dom'
import { Subscribe, Provider } from 'unstated'

import { PoolContainer } from './containers/poolContainer'
import { DirectoryContainer } from './containers/directoryContainer'
import { TransactionsContainer } from './containers/transactionsContainer'
import { ChartContainer } from './containers/chartContainer'
import App from './App'

export default function AppWrapper() {
  return (
    <Provider>
      <Subscribe to={[PoolContainer, TransactionsContainer, DirectoryContainer, ChartContainer]}>
        {(poolStore, transactionsStore, directoryStore, chartStore) => (
          <App
            poolStore={poolStore}
            transactionsStore={transactionsStore}
            directoryStore={directoryStore}
            chartStore={chartStore}
          />
        )}
      </Subscribe>
    </Provider>
  )
}

ReactDOM.render(<AppWrapper />, document.getElementById('root'))
