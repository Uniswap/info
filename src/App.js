import React from 'react'
import styled from 'styled-components'
import { ApolloProvider } from 'react-apollo'
import { client } from './apollo/client'
import { Route, Switch, BrowserRouter, withRouter, Redirect } from 'react-router-dom'
import ScrolToTop from './components/ScrollToTop'

import { useAllTokens } from './contexts/TokenData'

import GlobalPage from './pages/GlobalPage'
import TokenPage from './pages/TokenPage'
import PairPage from './pages/PairPage'
import NavHeader from './components/NavHeader'
import LocalLoader from './components/LocalLoader'
import { AutoColumn } from './components/Column'
import Link from './components/Link'
import { lighten } from 'polished'

const AppWrapper = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
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
  a {
    color: ${({ theme }) => theme.text1};
  }
`

function App() {
  const NavHeaderUpdated = withRouter(props => <NavHeader default {...props} />)

  const allTokens = useAllTokens()

  return (
    <ApolloProvider client={client}>
      <AppWrapper>
        <MigrateBanner>
          <b>This site displays analystics for Uniswap V2 only.</b>&nbsp;To see Uniswap V1 analytics&nbsp;
          <Link href="https://uniswap.info/" target="_blank">
            <b>click here ↗</b>
          </Link>
        </MigrateBanner>
        {allTokens ? (
          <BrowserRouter>
            <ScrolToTop />
            <Switch>
              <Route
                exacts
                strict
                path="/token/:tokenAddress"
                render={({ match }) => {
                  const searched =
                    allTokens &&
                    allTokens.filter(token => {
                      return token.id.toLowerCase() === match.params.tokenAddress.toLowerCase()
                    })
                  if (allTokens && searched.length > 0) {
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
                  if (true) {
                    return (
                      <>
                        <NavHeaderUpdated pair={match.params.pairAddress.toLowerCase()} />
                        <PairPage address={match.params.pairAddress.toLowerCase()} />
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
