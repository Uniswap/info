import React, { useState } from 'react'
import { ApolloProvider } from 'react-apollo'
import { client } from './apollo/client'
import { Route, Switch, BrowserRouter, withRouter, Redirect } from 'react-router-dom'
import Loader from './components/Loader'
import Wrapper from './components/Theme'
import NavHeader from './components/NavHeader'
import { ExchangePage } from './pages/ExchangePage'
import { OverviewPage } from './pages/OverviewPage'
import { useGlobalData } from './Data/GlobalData'
import { useUniswapHistory } from './Data/UniswapHistory'
import { timeframeOptions } from './constants'
import { useAllExchanges } from './Data/GetAllExchanges'

function App(props) {
  // set default time box to all time
  const [historyDaysToQuery, setHistoryDaysToQuery] = useState(timeframeOptions[3].value)

  // currency across site can be USD or ETH
  const [currencyUnit, setCurrencyUnit] = useState('USD')

  // historical data for chart on overview page
  const uniswapHistory = useUniswapHistory(historyDaysToQuery)

  // data for Uniswap totals on overview page, may be dependent on values in the future
  const globalData = useGlobalData()

  // essential data for each exchange above liqudiity threshold
  const exchanges = useAllExchanges()

  const NavHeaderUpdated = withRouter(props => (
    <NavHeader
      default
      {...props}
      exchanges={exchanges}
      currencyUnit={currencyUnit}
      setCurrencyUnit={setCurrencyUnit}
      setHistoryDaysToQuery={setHistoryDaysToQuery}
    />
  ))

  return (
    <ApolloProvider client={client}>
      <Wrapper>
        {globalData && exchanges && uniswapHistory ? (
          <BrowserRouter>
            <NavHeaderUpdated />
            <Switch>
              <Route
                exact
                strict
                path="/token/:exchangeAddressURL?"
                render={({ match }) => {
                  if (exchanges.hasOwnProperty(match.params.exchangeAddressURL)) {
                    return (
                      <ExchangePage
                        currencyUnit={currencyUnit}
                        address={match.params.exchangeAddressURL}
                        exchanges={exchanges}
                        historyDaysToQuery={historyDaysToQuery}
                        setHistoryDaysToQuery={setHistoryDaysToQuery}
                      />
                    )
                  } else {
                    return <Redirect to="/home" />
                  }
                }}
              />
              <Route path="/home">
                <OverviewPage
                  currencyUnit={currencyUnit}
                  globalData={globalData}
                  uniswapHistory={uniswapHistory}
                  historyDaysToQuery={historyDaysToQuery}
                  updateTimeframe={setHistoryDaysToQuery}
                />
              </Route>
              <Redirect to="/home" />
            </Switch>
          </BrowserRouter>
        ) : (
          <Loader fill="true" />
        )}
      </Wrapper>
    </ApolloProvider>
  )
}

export default App
