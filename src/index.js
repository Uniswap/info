import React from 'react'
import ReactDOM from 'react-dom'
import ReactGA from 'react-ga'
import { isMobile } from 'react-device-detect'
import ThemeProvider, { GlobalStyle } from './Theme'
import LocalStorageContextProvider, { Updater as LocalStorageContextUpdater } from './contexts/LocalStorage'
import ProvidersContextProvider, { Updater as ProvidersUpdater } from './contexts/Providers'
import PriceContextProvider, { Updater as PriceContextUpdater } from './contexts/Price'
import LiquidityContextProvider, { Updater as LiquidityContextUpdater } from './contexts/Liquidity'
import HistoryContextProvider from './contexts/History'
import TokenDataContextProvider, { Updater as TokenDataContextUpdater } from './contexts/TokenData'
import LiquidityChartContextProvider, { Updater as LiquidityChartContextUpdater } from './contexts/LiquidityChart'
import RewardsChartContextProvider, { Updater as RewardsChartContextUpdater } from './contexts/Rewards'

import App from './App'

// initialize GA
const GOOGLE_ANALYTICS_ID = process.env.REACT_APP_GOOGLE_ANALYTICS_ID
if (typeof GOOGLE_ANALYTICS_ID === 'string') {
  ReactGA.initialize(GOOGLE_ANALYTICS_ID)
  ReactGA.set({
    customBrowserType: !isMobile ? 'desktop' : 'web3' in window || 'ethereum' in window ? 'mobileWeb3' : 'mobileRegular'
  })
} else {
  ReactGA.initialize('test', { testMode: true, debug: true })
}

function ContextProviders({ children }) {
  return (
    <LocalStorageContextProvider>
      <RewardsChartContextProvider>
        <LiquidityChartContextProvider>
          <ProvidersContextProvider>
            <TokenDataContextProvider>
              <PriceContextProvider>
                <LiquidityContextProvider>
                  <HistoryContextProvider>{children}</HistoryContextProvider>
                </LiquidityContextProvider>
              </PriceContextProvider>
            </TokenDataContextProvider>
          </ProvidersContextProvider>
        </LiquidityChartContextProvider>
      </RewardsChartContextProvider>
    </LocalStorageContextProvider>
  )
}

function Updaters() {
  return (
    <>
      <LocalStorageContextUpdater />
      <LiquidityChartContextUpdater />
      <TokenDataContextUpdater />
      <PriceContextUpdater />
      <LiquidityContextUpdater />
      <ProvidersUpdater />
      <RewardsChartContextUpdater />
    </>
  )
}

ReactDOM.render(
  <ContextProviders>
    <Updaters />
    <ThemeProvider>
      <>
        <GlobalStyle />
        <App />
      </>
    </ThemeProvider>
  </ContextProviders>,
  document.getElementById('root')
)
