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
import SubHeader from './components/SubHeader'

const AppWrapper = styled.div`
  position: relative;
  width: 100%;
`
const ContentWrapper = styled.div`
  display: grid;

  @media screen and (max-width: 1080px) {
    grid-template-columns: 1fr;
    grid-gap: 0;
  }
`

const Right = styled.div`
  position: fixed;
  right: 0;
  bottom: 0rem;
  margin-top: 3rem;
  z-index: 99;
  width: 220px;
  height: ${({ open }) => (open ? 'fit-content' : '64px')};
  border-top-left-radius: 25px;

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
                        <SubHeader />

                        <ContentWrapper open={savedOpen}>
                          <Center id="center">
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
                        <SubHeader />

                        <ContentWrapper open={savedOpen}>
                          <Center id="center">
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
                        <SubHeader />

                        <ContentWrapper open={savedOpen}>
                          <Center id="center">
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
                <SubHeader />
                <ContentWrapper open={savedOpen}>
                  <Center id="center">
                    <GlobalPage />
                  </Center>
                  <Right open={savedOpen}>
                    <PinnedData open={savedOpen} setSavedOpen={setSavedOpen} />
                  </Right>
                </ContentWrapper>
              </Route>

              <Route path="/all-tokens">
                <NavHeaderUpdated />
                <SubHeader />

                <ContentWrapper open={savedOpen}>
                  <Center id="center">
                    <AllTokensPage />
                  </Center>
                  <Right open={savedOpen} onClick={() => setSavedOpen(true)}>
                    <PinnedData open={savedOpen} setSavedOpen={setSavedOpen} />
                  </Right>
                </ContentWrapper>
              </Route>

              <Route path="/all-pairs">
                <NavHeaderUpdated />
                <SubHeader />

                <ContentWrapper open={savedOpen}>
                  <Center id="center">
                    <AllPairsPage />
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
