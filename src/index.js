import ReactDOM from 'react-dom'
import { StrictMode } from 'react'
import ReactGA from 'react-ga'
import { isMobile } from 'react-device-detect'
import ThemeProvider, { GlobalStyle } from './Theme'
import LocalStorageContextProvider, { Updater as LocalStorageContextUpdater } from './contexts/LocalStorage'
import TokenDataContextProvider, { Updater as TokenDataContextUpdater } from './contexts/TokenData'
import GlobalDataContextProvider from './contexts/GlobalData'
import PairDataContextProvider, { Updater as PairDataContextUpdater } from './contexts/PairData'
import ApplicationContextProvider from './contexts/Application'
import UserContextProvider from './contexts/User'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import utc from 'dayjs/plugin/utc'
import App from './App'
import './i18n'

// initialize custom dayjs plugin
dayjs.extend(utc)
dayjs.extend(weekOfYear)

// initialize GA
const GOOGLE_ANALYTICS_ID = process.env.REACT_APP_GOOGLE_ANALYTICS_ID

if (typeof GOOGLE_ANALYTICS_ID === 'string' && GOOGLE_ANALYTICS_ID !== '') {
  ReactGA.initialize(GOOGLE_ANALYTICS_ID)
  ReactGA.set({
    customBrowserType: !isMobile ? 'desktop' : 'web3' in window || 'ethereum' in window ? 'mobileWeb3' : 'mobileRegular'
  })
  ReactGA.pageview(window.location.pathname)
} else {
  ReactGA.initialize('test', { testMode: true, debug: true })
}

function ContextProviders({ children }) {
  return (
    <LocalStorageContextProvider>
      <ApplicationContextProvider>
        <TokenDataContextProvider>
          <GlobalDataContextProvider>
            <PairDataContextProvider>
              <UserContextProvider>{children}</UserContextProvider>
            </PairDataContextProvider>
          </GlobalDataContextProvider>
        </TokenDataContextProvider>
      </ApplicationContextProvider>
    </LocalStorageContextProvider>
  )
}

function Updaters() {
  return (
    <>
      <LocalStorageContextUpdater />
      <PairDataContextUpdater />
      <TokenDataContextUpdater />
    </>
  )
}

ReactDOM.render(
  <StrictMode>
    <ContextProviders>
      <Updaters />
      <ThemeProvider>
        <>
          <GlobalStyle />
          <App />
        </>
      </ThemeProvider>
    </ContextProviders>
  </StrictMode>,
  document.getElementById('root')
)
