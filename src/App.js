import React, { useState } from 'react'
import { Route, Switch, BrowserRouter, Redirect } from 'react-router-dom'
import styled from 'styled-components'
import { ApolloProvider } from 'react-apollo'
import { Text } from 'rebass'

import { client } from './apollo/client'
import GlobalPage from './pages/GlobalPage'
import TokenPage from './pages/TokenPage'
import PairPage from './pages/PairPage'
import PoolPage from './pages/PoolPage'
import { useGlobalData, useGlobalChartData } from './contexts/GlobalData'
import { getNetworkName, isAddress } from './utils'
import AccountPage from './pages/AccountPage'
import AllTokensPage from './pages/AllTokensPage'
import AllPairsPage from './pages/AllPairsPage'
import PinnedData from './components/PinnedData'
import SideNav from './components/SideNav'
import AccountLookup from './pages/AccountLookup'
import { OVERVIEW_TOKEN_BLACKLIST, PAIR_BLACKLIST } from './constants'
import LocalLoader from './components/LocalLoader'
import { ButtonDark } from './components/ButtonStyled'
import { useExchangeClient, useLatestBlocks } from './contexts/Application'
import useTheme from './hooks/useTheme'
import BottomBar from './components/BottomBar'
import KyberSwapAnounce from './components/KyberSwapAnnounce'

const AppWrapper = styled.div`
  position: relative;
  width: 100%;
`
const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: ${({ open }) => (open ? '220px 1fr 200px' : '220px 1fr 64px')};

  @media screen and (max-width: 1400px) {
    grid-template-columns: 220px 1fr;
  }

  @media screen and (max-width: 1080px) {
    grid-template-columns: 1fr;
    max-width: 100vw;
    overflow: hidden;
    grid-gap: 0;
  }
`

const Right = styled.div`
  position: sticky;
  top: 0;
  right: 0;
  bottom: 0rem;
  z-index: 10000;
  height: ${({ open }) => (open ? 'fit-content' : '64px')};
  overflow: auto;
  overflow-x: hidden;
  background-color: ${({ theme }) => theme.background};
  @media screen and (max-width: 1400px) {
    display: none;
  }
`

const Center = styled.div`
  position: relative;
  height: 100%;
  z-index: 10;
  transition: width 0.25s ease;
  background-color: ${({ theme }) => theme.buttonBlack};
`

const WarningWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`

const WarningBanner = styled.div`
  border: 1px solid ${({ theme }) => theme.warningBorder};
  background: ${({ theme }) => theme.warningBackground};
  padding: 1.5rem 2.5rem;
  color: ${({ theme }) => theme.warningTextColor};
  width: 100%;
  text-align: center;
  font-weight: 500;

  @media screen and (max-width: 800px) {
    padding: 1.5rem 1rem;
  }
`

const CloseButtonWrapper = styled.div`
  margin-top: 1rem;
  cursor: pointer;
  color: ${({ theme }) => theme.warningTextColor};
`

const Marginer = styled.div`
  margin-top: 3rem;
`

/**
 * Wrap the component with the header and sidebar pinned tab
 */
const LayoutWrapper = ({ children, savedOpen, setSavedOpen }) => {
  return (
    <>
      <KyberSwapAnounce />
      <ContentWrapper open={savedOpen}>
        <SideNav />
        <BottomBar />
        <Center id="center">
          {children}
          <Marginer />
        </Center>
        <Right open={savedOpen}>
          <PinnedData open={savedOpen} setSavedOpen={setSavedOpen} />
        </Right>
      </ContentWrapper>
    </>
  )
}

const BLOCK_DIFFERENCE_THRESHOLD = process.env.REACT_APP_CHAIN_ID === '137' ? 210 : 30

function App() {
  const [savedOpen, setSavedOpen] = useState(false)
  const theme = useTheme()

  const globalData = useGlobalData()
  const globalChartData = useGlobalChartData()
  const [latestBlock, headBlock] = useLatestBlocks()
  const exchangeSubgraphClient = useExchangeClient()

  const [dismissed, markAsDismissed] = useState(false)

  // show warning
  const showWarning = headBlock && latestBlock ? headBlock - latestBlock > BLOCK_DIFFERENCE_THRESHOLD : false

  return (
    <ApolloProvider client={exchangeSubgraphClient || client}>
      <AppWrapper>
        {!dismissed && showWarning && (
          <WarningWrapper>
            <WarningBanner>
              <div>
                <Text fontWeight={500} fontSize={14} color={'#ffaf01'} style={{ display: 'inline' }} mr={'8px'}>
                  Warning:
                </Text>
                {`The data on this site has only synced to ${getNetworkName()} block ${latestBlock} (out of ${headBlock}). Please check back soon.`}
              </div>

              <CloseButtonWrapper>
                <ButtonDark color={theme.primary} style={{ minWidth: '140px' }} onClick={() => markAsDismissed(true)}>
                  Close
                </ButtonDark>
              </CloseButtonWrapper>
            </WarningBanner>
          </WarningWrapper>
        )}
        {latestBlock &&
        globalData &&
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
                  if (OVERVIEW_TOKEN_BLACKLIST.includes(match.params.tokenAddress.toLowerCase())) {
                    return <Redirect to="/home" />
                  }
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
                  if (PAIR_BLACKLIST.includes(match.params.pairAddress.toLowerCase())) {
                    return <Redirect to="/home" />
                  }
                  return (
                    <LayoutWrapper savedOpen={savedOpen} setSavedOpen={setSavedOpen}>
                      <PairPage pairAddress={match.params.pairAddress.toLowerCase()} />
                    </LayoutWrapper>
                  )
                }}
              />

              <Route
                exacts
                strict
                path="/pool/:poolAddress"
                render={({ match }) => {
                  if (PAIR_BLACKLIST.includes(match.params.poolAddress.toLowerCase())) {
                    return <Redirect to="/home" />
                  }
                  return (
                    <LayoutWrapper savedOpen={savedOpen} setSavedOpen={setSavedOpen}>
                      <PoolPage poolAddress={match.params.poolAddress.toLowerCase()} />
                    </LayoutWrapper>
                  )
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
          <LocalLoader fill="true" size="200px" />
        )}
      </AppWrapper>
    </ApolloProvider>
  )
}

export default App
