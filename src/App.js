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
import { AutoColumn } from './components/Column'
import Link from './components/Link'
import { useMedia } from 'react-use'
import { useGlobalData, useGlobalChartData } from './contexts/GlobalData'
import { isAddress } from './helpers'
import { OVERVIEW_TOKEN_BLACKLIST, OVERVIEW_PAIR_BLACKLIST } from './constants'
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

const MigrateBanner = styled(AutoColumn)`
  width: 100%;
  padding: 12px 0;
  display: flex;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.3);
  color: ${({ theme }) => theme.text1};
  font-weight: 500;
  text-align: center;
  z-index: 10;
  a {
    color: ${({ theme }) => theme.text1};
  }
`

function App() {
  const NavHeaderUpdated = withRouter(props => <NavHeader default {...props} />)

  const below750 = useMedia('(max-width: 750px)')
  const below490 = useMedia('(max-width: 490px)')

  const globalData = useGlobalData()
  const globalChartData = useGlobalChartData()

  return (
    <ApolloProvider client={client}>
      <AppWrapper>
        <MigrateBanner>
          {below490 ? (
            <>
              <Link href="https://v1.uniswap.info/" target="_blank">
                <b>V1 Analytics ↗</b>
              </Link>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <Link href="https://migrate.uniswap.info/" target="_blank">
                <b>Combined Analytics ↗</b>
              </Link>
            </>
          ) : below750 ? (
            <>
              <b>This site is for Uniswap V2 only.</b>&nbsp;For V1 analytics&nbsp;
              <Link href="https://v1.uniswap.info/" target="_blank">
                <b>click here ↗</b>
              </Link>
            </>
          ) : (
            <>
              <b>This site displays analytics for Uniswap V2 only.</b>&nbsp; To see Uniswap V1 analytics&nbsp;
              <Link href="https://v1.uniswap.info/" target="_blank">
                <b>click here ↗</b>
              </Link>
            </>
          )}
        </MigrateBanner>
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
                  if (
                    isAddress(match.params.tokenAddress.toLowerCase()) &&
                    !OVERVIEW_TOKEN_BLACKLIST.includes(match.params.tokenAddress.toLowerCase())
                  ) {
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
                  if (
                    isAddress(match.params.pairAddress.toLowerCase()) &&
                    !OVERVIEW_PAIR_BLACKLIST.includes(match.params.pairAddress.toLowerCase())
                  ) {
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
