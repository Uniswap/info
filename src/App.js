import React from 'react'
import styled from 'styled-components'
import { ApolloProvider } from 'react-apollo'
import { client } from './apollo/client'
import { Route, Switch, BrowserRouter, withRouter, Redirect } from 'react-router-dom'

import GlobalPage from './pages/GlobalPage'
import TokenPage from './pages/TokenPage'
import PairPage from './pages/PairPage'
import NavHeader from './components/NavHeader'
import LocalLoader from './components/LocalLoader'
import { useGlobalData, useGlobalChartData } from './contexts/GlobalData'
import { isAddress } from './utils'
import AccountPage from './pages/AccountPage'
import AllTokensPage from './pages/AllTokensPage'
import AllPairsPage from './pages/AllPairsPage'

const AppWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 100vw;
  min-height: 100vh;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
`

function App() {
  const NavHeaderUpdated = withRouter(props => <NavHeader default {...props} />)

  const globalData = useGlobalData()
  const globalChartData = useGlobalChartData()

  return (
    <ApolloProvider client={client}>
      <AppWrapper>
        {globalData &&
        Object.keys(globalData).length > 0 &&
        globalChartData &&
        Object.keys(globalChartData).length > 0 ? (
          <BrowserRouter>
            <Switch>
              <Route
                exacts
                strict
                path="/token/:tokenAddress"
                render={({ match }) => {
                  if (isAddress(match.params.tokenAddress.toLowerCase())) {
                    return (
                      <>
                        <NavHeaderUpdated token={match.params.tokenAddress.toLowerCase()} />
                        <TokenPage address={match.params.tokenAddress.toLowerCase()} />
                      </>
                    )
                  } else {
                    return <Redirect to="/home" />
                  }
                }}
              />
              <Route
                exacts
                strict
                path="/pair/:pairAddress"
                render={({ match }) => {
                  if (isAddress(match.params.pairAddress.toLowerCase())) {
                    return (
                      <>
                        <NavHeaderUpdated pair={match.params.pairAddress.toLowerCase()} />
                        <PairPage pairAddress={match.params.pairAddress.toLowerCase()} />
                      </>
                    )
                  } else {
                    return <Redirect to="/home" />
                  }
                }}
              />
              <Route
                exacts
                strict
                path="/account/:accountAddress"
                render={({ match }) => {
                  if (isAddress(match.params.accountAddress.toLowerCase())) {
                    return (
                      <>
                        <NavHeaderUpdated account={match.params.accountAddress.toLowerCase()} />
                        <AccountPage account={match.params.accountAddress.toLowerCase()} />
                      </>
                    )
                  } else {
                    return <Redirect to="/home" />
                  }
                }}
              />
              <Route path="/home">
                <NavHeaderUpdated />
                <GlobalPage />
              </Route>
              <Route path="/all-tokens">
                <NavHeaderUpdated />
                <AllTokensPage />
              </Route>
              <Route path="/all-pairs">
                <NavHeaderUpdated />
                <AllPairsPage />
              </Route>
              <Redirect to="/home" />
            </Switch>
          </BrowserRouter>
        ) : (
          <LocalLoader fill="true" />
        )}
      </AppWrapper>
    </ApolloProvider>
  )
}

export default App
