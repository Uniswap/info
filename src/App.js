import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
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

const WarningWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`

const WarningBanner = styled.div`
  background-color: #ff6871;
  padding: 1.5rem;
  color: white;
  width: 100%;
  text-align: center;
  font-weight: 500;
`

function App() {
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
        <WarningWrapper>
          <WarningBanner>
            Warning: The data on this site has not been updated since 03/09/20. Please check back soon.
          </WarningBanner>
        </WarningWrapper>
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
            <LocalLoader fill="true" />
          )}
        </div>
      </Wrapper>
    </ApolloProvider>
  )
}

export default App
