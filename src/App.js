import React, { useState } from 'react'
import styled from 'styled-components'
import { ApolloProvider } from 'react-apollo'
import { client } from './apollo/client'
import { Route, Switch, BrowserRouter, Redirect } from 'react-router-dom'
import GlobalPage from './pages/GlobalPage'
import TokenPage from './pages/TokenPage'
import PairPage from './pages/PairPage'
import LocalLoader from './components/LocalLoader'
import { useGlobalData, useGlobalChartData } from './contexts/GlobalData'
import { isAddress } from './utils'
import AccountPage from './pages/AccountPage'
import AllTokensPage from './pages/AllTokensPage'
import AllPairsPage from './pages/AllPairsPage'
import PinnedData from './components/PinnedData'

import SideNav from './components/SideNav'
import AccountLookup from './pages/AccountLookup'

const AppWrapper = styled.div`
  position: relative;
  width: 100%;
`
const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: ${({ open }) => (open ? '196px 1fr 200px' : '196px 1fr 64px')};

  @media screen and (max-width: 1080px) {
    grid-template-columns: 1fr;
    grid-gap: 0;
  }
`

const Right = styled.div`
  position: fixed;
  right: 0;
  bottom: 0rem;
  z-index: 99;
  width: ${({ open }) => (open ? '200px' : '64px')};
  height: ${({ open }) => (open ? 'fit-content' : '64px')};

  @media screen and (max-width: 1080px) {
    display: none;
  }
`

const Center = styled.div`
  height: 100%;
  z-index: 9999;
  transition: width 0.25s ease;

  border-radius: 12px;
  background-color: ${({ theme }) => theme.white};
`

/**
 * Wrap the component with the header and sidebar pinned tab
 */
const LayoutWrapper = ({ children, savedOpen, setSavedOpen }) => {
  return (
    <>
      <ContentWrapper open={savedOpen}>
        <SideNav />
        <Center id="center">{children}</Center>
        <Right open={savedOpen}>
          <PinnedData open={savedOpen} setSavedOpen={setSavedOpen} />
        </Right>
      </ContentWrapper>
    </>
  )
}

function App() {
  const [savedOpen, setSavedOpen] = useState(false)

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
                      <LayoutWrapper savedOpen={savedOpen} setSavedOpen={setSavedOpen}>
                        <TokenPage address={match.params.tokenAddress.toLowerCase()} />
                      </LayoutWrapper>
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
                      <LayoutWrapper savedOpen={savedOpen} setSavedOpen={setSavedOpen}>
                        <PairPage pairAddress={match.params.pairAddress.toLowerCase()} />
                      </LayoutWrapper>
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
                      <LayoutWrapper savedOpen={savedOpen} setSavedOpen={setSavedOpen}>
                        <AccountPage account={match.params.accountAddress.toLowerCase()} />
                      </LayoutWrapper>
                    )
                  } else {
                    return <Redirect to="/home" />
                  }
                }}
              />

              <Route path="/home">
                <LayoutWrapper savedOpen={savedOpen} setSavedOpen={setSavedOpen}>
                  <GlobalPage />
                </LayoutWrapper>
              </Route>

              <Route path="/tokens">
                <LayoutWrapper savedOpen={savedOpen} setSavedOpen={setSavedOpen}>
                  <AllTokensPage />
                </LayoutWrapper>
              </Route>

              <Route path="/pairs">
                <LayoutWrapper savedOpen={savedOpen} setSavedOpen={setSavedOpen}>
                  <AllPairsPage />
                </LayoutWrapper>
              </Route>

              <Route path="/accounts">
                <LayoutWrapper savedOpen={savedOpen} setSavedOpen={setSavedOpen}>
                  <AccountLookup />
                </LayoutWrapper>
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
