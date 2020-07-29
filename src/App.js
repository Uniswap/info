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
import PinnedData from './components/PinnedData'
import AccountLookup from './pages/AccountLookup'
import SubHeader from './components/SubHeader'

const AppWrapper = styled.div`
  position: relative;
  width: 100%;
`
const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: ${({ open }) => (open ? '1fr 220px' : '1fr 80px')};
  grid-gap: 0rem;

  @media screen and (max-width: 1080px) {
    grid-template-columns: 1fr;
  }
`

const Right = styled.div`
  position: sticky;
  top: 32px;
  width: ${({ open }) => (open ? '220px' : '80px')};
  height: ${({ open }) => (open ? '100%' : '20px')};

  @media screen and (max-width: 1080px) {
    display: none;
  }
`

const Center = styled.div`
  height: 100%;
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
                        <ContentWrapper open={savedOpen}>
                          <Center id="center">
                            <SubHeader />
                            <TokenPage address={match.params.tokenAddress.toLowerCase()} />
                          </Center>
                          <Right open={savedOpen}>
                            <PinnedData open={savedOpen} setSavedOpen={setSavedOpen} />
                          </Right>
                        </ContentWrapper>
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
                        <ContentWrapper open={savedOpen}>
                          <Center id="center">
                            <SubHeader />
                            <PairPage pairAddress={match.params.pairAddress.toLowerCase()} />
                          </Center>
                          <Right open={savedOpen}>
                            <PinnedData open={savedOpen} setSavedOpen={setSavedOpen} />
                          </Right>
                        </ContentWrapper>
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
                        <NavHeaderUpdated />
                        <ContentWrapper open={savedOpen}>
                          <Center id="center">
                            <SubHeader />
                            <AccountPage account={match.params.accountAddress.toLowerCase()} />
                          </Center>
                          <Right open={savedOpen}>
                            <PinnedData open={savedOpen} setSavedOpen={setSavedOpen} />
                          </Right>
                        </ContentWrapper>
                      </>
                    )
                  } else {
                    return <Redirect to="/home" />
                  }
                }}
              />

              <Route path="/home">
                <NavHeaderUpdated />
                <ContentWrapper open={savedOpen}>
                  <Center id="center">
                    <SubHeader />
                    <GlobalPage />
                  </Center>
                  <Right open={savedOpen}>
                    <PinnedData open={savedOpen} setSavedOpen={setSavedOpen} />
                  </Right>
                </ContentWrapper>
              </Route>

              <Route path="/all-tokens">
                <NavHeaderUpdated />
                <ContentWrapper open={savedOpen}>
                  <Center id="center">
                    <SubHeader />
                    <AllTokensPage />
                  </Center>
                  <Right open={savedOpen}>
                    <PinnedData open={savedOpen} setSavedOpen={setSavedOpen} />
                  </Right>
                </ContentWrapper>
              </Route>

              <Route path="/all-pairs">
                <NavHeaderUpdated />
                <ContentWrapper open={savedOpen}>
                  <Center id="center">
                    <SubHeader />
                    <AllPairsPage />
                  </Center>
                  <Right open={savedOpen}>
                    <PinnedData open={savedOpen} setSavedOpen={setSavedOpen} />
                  </Right>
                </ContentWrapper>
              </Route>

              <Route path="/account-lookup">
                <NavHeaderUpdated />
                <ContentWrapper open={savedOpen}>
                  <Center id="center">
                    <SubHeader />
                    <AccountLookup />
                  </Center>
                  <Right open={savedOpen}>
                    <PinnedData open={savedOpen} setSavedOpen={setSavedOpen} />
                  </Right>
                </ContentWrapper>
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
