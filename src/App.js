import React, { useState } from 'react'
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
import SideNav from './components/SideNav'
import PinnedData from './components/PinnedData'

const AppWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
`
const ContentWrapper = styled.div`
  height: 100%;
`

const Left = styled.div`
  width: 200px;
  top: 0px;
  padding-top: 80px;
  bottom: 0px;
  position: fixed;
  height: 100%;
  left: 0;
  border-right: 1px solid ${({ theme }) => theme.bg3};
`

const Right = styled.div`
  width:  ${({ open }) => (open ? '148px' : '80px')};
  top: 80px;
  bottom: 0px;
  position: fixed;
  height: ${({ open }) => (open ? '100%' : '20px')}
  right: 0;
  padding: 2rem;
  border-left: 1px solid ${({ theme }) => theme.bg3};
  border-top: 1px solid ${({ theme }) => theme.bg3};
  border-top-left-radius: 25px;
  border-bottom-left-radius: ${({ open }) => (open ? '0' : '25px')}
  border-bottom: ${({ open, theme }) => (open ? '' : '1px solid' + theme.bg3)}
`

const Center = styled.div`
  height: 100%
  margin: 0px 200px;
  margin-right: 220px;
`

function App() {
  const NavHeaderUpdated = withRouter(props => <NavHeader default {...props} />)

  const [savedOpen, setSavedOpen] = useState(true)

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
                <ContentWrapper>
                  <Left>
                    <SideNav />
                  </Left>
                  <Center>
                    <GlobalPage />
                  </Center>
                  <Right open={savedOpen}>
                    <PinnedData open={savedOpen} setSavedOpen={setSavedOpen} />
                  </Right>
                </ContentWrapper>
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
