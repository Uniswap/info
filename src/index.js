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
    <ThemeProvider>
      <GlobalStyle />
      <App />
    </ThemeProvider>
  </ContextProviders>,
  document.getElementById('root')
)
