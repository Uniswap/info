import ReactDOM from 'react-dom'
import { StrictMode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import ReactGA from 'react-ga'
import { isMobile } from 'react-device-detect'
import { ApolloProvider } from '@apollo/react-hooks'
import ThemeProvider, { GlobalStyle } from './Theme'
import TokenDataContextProvider from './contexts/TokenData'
import PairDataContextProvider from './contexts/PairData'
import UserContextProvider from './contexts/User'
import { PersistGate } from 'redux-persist/integration/react'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import utc from 'dayjs/plugin/utc'
import { store, persistor } from 'state/store'
import { Provider } from 'react-redux'
import App from './App'
import './i18n'
import ApiService from 'api/ApiService'

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
    <TokenDataContextProvider>
      <PairDataContextProvider>
        <UserContextProvider>{children}</UserContextProvider>
      </PairDataContextProvider>
    </TokenDataContextProvider>
  )
}

ReactDOM.render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ContextProviders>
          <ThemeProvider>
            <ApolloProvider client={ApiService.graphqlClient}>
              <GlobalStyle />
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </ApolloProvider>
          </ThemeProvider>
        </ContextProviders>
      </PersistGate>
    </Provider>
  </StrictMode>,
  document.getElementById('root')
)
