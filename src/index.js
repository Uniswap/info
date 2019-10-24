import React from 'react'
import ReactDOM from 'react-dom'
import Web3Provider from 'web3-react'
import { Subscribe, Provider } from 'unstated'
import { DirectoryContainer } from './containers/directoryContainer'
import App from './App'
import { Connectors } from 'web3-react'
import { ParallaxProvider } from 'react-scroll-parallax'

const { InjectedConnector } = Connectors

const MetaMask = new InjectedConnector({ supportedNetworks: [1] })

const connectors = { MetaMask }

export default function AppWrapper() {
  return (
    <ParallaxProvider>
      <Provider>
        <Subscribe to={[DirectoryContainer]}>{directoryStore => <App directoryStore={directoryStore} />}</Subscribe>
      </Provider>
    </ParallaxProvider>
  )
}

ReactDOM.render(
  <Web3Provider connectors={connectors} libraryName="ethers.js">
    <AppWrapper />
  </Web3Provider>,
  document.getElementById('root')
)
