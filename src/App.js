import React, { useState, useEffect } from 'react'
import { ApolloProvider } from 'react-apollo'
import { client } from './apollo/client'
import { Route, Switch, BrowserRouter, withRouter, Redirect } from 'react-router-dom'
import Wrapper from './components/Theme'
import NavHeader from './components/NavHeader'
import { ExchangeWrapper } from './pages/ExchangeWrapper'
import { OverviewPage } from './pages/OverviewPage'
import { useGlobalData } from './Data/GlobalData'
import { useUniswapHistory } from './Data/UniswapHistory'
import { timeframeOptions } from './constants'
import { useAllExchanges } from './Data/GetAllExchanges'
import LocalLoader from './components/LocalLoader'

function App() {
  // set default time box to all time
  const [historyDaysToQuery, setHistoryDaysToQuery] = useState(timeframeOptions[3].value)

  // the window to aggregate accross
  const [timeWindow, setTimeWindow] = useState('weekly')

  // currency across site can be USD or ETH
  const [currencyUnit, setCurrencyUnit] = useState('USD')

  // historical data for chart on overview page
  const [uniswapHistory, monthlyHistory, weeklyHistory] = useUniswapHistory(historyDaysToQuery)

  // data for Uniswap totals on overview page, may be dependent on values in the future
  const globalData = useGlobalData()

  // essential data for each exchange above liqudiity threshold
  const exchanges = useAllExchanges()

  //used for route loading
  const [length, setLength] = useState(0)

  const [tokenToExchangeMap, setTokenToExchangeMap] = useState()

  useEffect(() => {
    if (exchanges) {
      setLength(Object.keys(exchanges).length)
    }
    let newSet = {}
    Object.keys(exchanges).map(key => {
      newSet[exchanges[key].tokenAddress.toLowerCase()] = key
      return true
    })
    setTokenToExchangeMap(newSet)
  }, [exchanges])

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
        <div style={{ position: 'relative' }}>
          {globalData && uniswapHistory && length > 0 ? (
            <BrowserRouter>
              <NavHeaderUpdated />
              <Switch>
                <Route
                  exact
                  strict
                  path="/token/:tokenAddressURL?"
                  render={({ match }) => {
                    if (exchanges && tokenToExchangeMap.hasOwnProperty(match.params.tokenAddressURL.toLowerCase())) {
                      return (
                        <ExchangeWrapper
                          currencyUnit={currencyUnit}
                          address={tokenToExchangeMap[match.params.tokenAddressURL.toLowerCase()]}
                          exchanges={exchanges}
                          historyDaysToQuery={historyDaysToQuery}
                          timeWindow={timeWindow}
                          setTimeWindow={setTimeWindow}
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
                    monthlyHistory={monthlyHistory}
                    weeklyHistory={weeklyHistory}
                    timeWindow={timeWindow}
                    setTimeWindow={setTimeWindow}
                    historyDaysToQuery={historyDaysToQuery}
                    updateTimeframe={setHistoryDaysToQuery}
                  />
                </Route>
                <Redirect to="/home" />
              </Switch>
            </BrowserRouter>
          ) : (
            <LocalLoader fill="true" />
          )}
        </div>
      </Wrapper>
    </ApolloProvider>
  )
}

export default App
