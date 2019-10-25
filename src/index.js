import React from 'react'
import ReactDOM from 'react-dom'
import Web3Provider from 'web3-react'
import { Subscribe, Provider } from 'unstated'
import { DirectoryContainer } from './containers/directoryContainer'
import App from './App'
import { Connectors } from 'web3-react'

const { InjectedConnector } = Connectors

// right now only support mainet as our graph tracks that only
const MetaMask = new InjectedConnector({ supportedNetworks: [1] })

const connectors = { MetaMask }

/**
 * This is the last legacy data fetching strategy. In future updates we should move this into
 * some data context.
 *
 */
export default function AppWrapper() {
  return (
    <Provider>
      <Subscribe to={[DirectoryContainer]}>{directoryStore => <App directoryStore={directoryStore} />}</Subscribe>
    </Provider>
  )
}

ReactDOM.render(
  <Web3Provider connectors={connectors} libraryName="ethers.js">
    <AppWrapper />
  </Web3Provider>,
  document.getElementById('root')
)
