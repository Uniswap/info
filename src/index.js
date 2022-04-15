import React from 'react'
import ReactDOM from 'react-dom'
import ThemeProvider, { GlobalStyle } from './Theme'
import LocalStorageContextProvider from './contexts/LocalStorage'
import TokenDataContextProvider from './contexts/TokenData'
import GlobalDataContextProvider from './contexts/GlobalData'
import PairDataContextProvider from './contexts/PairData'
import PoolDataContextProvider from './contexts/PoolData'
import ApplicationContextProvider from './contexts/Application'
import NetworkInfoContextProvider from './contexts/NetworkInfo'
import UserContextProvider from './contexts/User'
import App from './App'
import ReactGA from 'react-ga'
import { Updater as LocalStorageContextUpdater } from './contexts/LocalStorage'
import { Updater as TokenDataContextUpdater } from './contexts/TokenData'
import { Updater as PairDataContextUpdater } from './contexts/PairData'
import { Updater as PoolDataContextUpdater } from './contexts/PoolData'

const initGoogleAnalytics = () => {
  ReactGA.initialize('UA-207888714-1')
}

initGoogleAnalytics()

function Updaters() {
  return (
    <>
      <LocalStorageContextUpdater />
      <PairDataContextUpdater />
      <PoolDataContextUpdater />
      <TokenDataContextUpdater />
    </>
  )
}

function ContextProviders({ children }) {
  return (
    <LocalStorageContextProvider>
      <ApplicationContextProvider>
        <TokenDataContextProvider>
          <GlobalDataContextProvider>
            <PairDataContextProvider>
              <PoolDataContextProvider>
                <UserContextProvider>
                  <NetworkInfoContextProvider>{children}</NetworkInfoContextProvider>
                </UserContextProvider>
              </PoolDataContextProvider>
            </PairDataContextProvider>
          </GlobalDataContextProvider>
        </TokenDataContextProvider>
      </ApplicationContextProvider>
    </LocalStorageContextProvider>
  )
}

ReactDOM.render(
  <ContextProviders>
    <Updaters />
    <ThemeProvider>
      <GlobalStyle />
      <App />
    </ThemeProvider>
  </ContextProviders>,
  document.getElementById('root')
)
