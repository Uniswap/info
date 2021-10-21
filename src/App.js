import React, { useState } from 'react'
import styled from 'styled-components'
import { darken } from 'polished'
import { Box } from 'rebass/styled-components'
import { ApolloProvider } from 'react-apollo'
import { useMedia } from 'react-use'
import { client } from './apollo/client'
import { Route, Switch, BrowserRouter, Redirect, NavLink, useRouteMatch } from 'react-router-dom'
import GlobalPage from './pages/GlobalPage'
import TokenPage from './pages/TokenPage'
import PairPage from './pages/PairPage'
import { useGlobalData, useGlobalChartData } from './contexts/GlobalData'
import { isAddress } from './utils'
import AccountPage from './pages/AccountPage'
import AllTokensPage from './pages/AllTokensPage'
import AllPairsPage from './pages/AllPairsPage'
// import PinnedData from "./components/PinnedData";

// import SideNav from "./components/SideNav";
// import AccountLookup from "./pages/AccountLookup";
import LocalLoader from './components/LocalLoader'
import Header from './components/Header'
import Footer from './components/Footer'
import Search from './components/Search'
import { useLatestBlocks } from './contexts/Application'
import GoogleAnalyticsReporter from './components/analytics/GoogleAnalyticsReporter'
import { PAIR_BLACKLIST, TOKEN_BLACKLIST } from './constants'
import BackgroundDesktop from './assets/background-desktop.png'
import BackgroundMobile from './assets/background-mobile.png'

import 'bootstrap/dist/css/bootstrap.min.css'

const AppWrapper = styled.div`
  position: relative;
  width: 100%;
`
const ContentWrapper = styled.div`
  background-image: url(${BackgroundDesktop});
  background-repeat: no-repeat;
  background-size: contain;
  background-color: #020711;
  min-height: 100vh;
  @media (max-width: 576px) {
    background-image: url(${BackgroundMobile});
    min-height: 100vh;
  }
`

const Right = styled.div`
  position: fixed;
  right: 0;
  bottom: 0rem;
  z-index: 99;
  width: ${({ open }) => (open ? '220px' : '64px')};
  height: ${({ open }) => (open ? 'fit-content' : '64px')};
  overflow: auto;
  background-color: ${({ theme }) => theme.bg1};
  @media screen and (max-width: 1400px) {
    display: none;
  }
`

const Center = styled.div`
  height: 100%;
  z-index: 9999;
  transition: width 0.25s ease;
  min-height: calc(100vh - 316px);
`

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

const Row = styled(Box)`
  width: ${({ width }) => width ?? '100%'};
  display: flex;
  padding: 0;
  align-items: ${({ align }) => align ?? 'center'};
  justify-content: ${({ justify }) => justify ?? 'flex-start'};
  padding: ${({ padding }) => padding};
  border: ${({ border }) => border};
  border-radius: ${({ borderRadius }) => borderRadius};
`
const HeaderLinks = styled(Row)`
  justify-self: center;
  width: fit-content;
  padding: 4px;
  border-radius: 16px;
  display: grid;
  grid-auto-flow: column;
  overflow: auto;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    justify-self: center;
  `};
  @media screen and (max-width: 576px) {
    width: 100%;
    display: flex;
  }
`

const StyledNavLink = styled(NavLink)`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text3};
  font-size: 1rem;
  font-weight: 500;
  padding: 8px 20px 20px;
  word-break: break-word;
  overflow: hidden;
  white-space: nowrap;
  border-bottom: 4px solid #243f52;

  &.active {
    font-weight: 600;
    justify-content: center;
    color: ${({ theme }) => theme.white};
    border-bottom: 4px solid ${({ theme }) => theme.green1};
  }
  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.white)};
  }

  @media screen and (max-width: 576px) {
    width: 33.33%;
    text-align: center;
  }
`

export const NavWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1440px;
  width: 100%;
  margin: 60px auto 4px;
  padding: 0 2rem;
  box-sizing: border-box;
  @media screen and (max-width: 1180px) {
    padding: 0 1rem;
  }
  @media screen and (max-width: 576px) {
    margin: 40px auto 4px;
  }
`

/**
 * Wrap the component with the header and sidebar pinned tab
 */
// eslint-disable-next-line react/prop-types
const LayoutWrapper = ({ children, savedOpen, setSavedOpen }) => {
  const below800 = useMedia('(max-width: 768px)')
  let match = useRouteMatch('/home')

  return (
    <>
      <ContentWrapper open={savedOpen}>
        {/* <SideNav /> */}
        <Header />
        <NavWrapper>
          <HeaderLinks>
            <StyledNavLink id={`swap-nav-link`} to={'/home'}>
              Overview
            </StyledNavLink>
            <StyledNavLink
              id={`pool-nav-link`}
              to={'/pools'}
              isActive={(match, { pathname }) => Boolean(match) || pathname.startsWith('/pair')}
            >
              Pools
            </StyledNavLink>
            <StyledNavLink
              id={`charts-nav-link`}
              to={'/tokens'}
              isActive={(match, { pathname }) => {
                return Boolean(match) || pathname.startsWith('/token')
              }}
              className="d-none hidden-token"
            >
              Tokens
            </StyledNavLink>
          </HeaderLinks>
          {!below800 && !match && <Search small={true} />}
        </NavWrapper>
        <Center id="center">{children}</Center>
        {/* <Right open={savedOpen}>
          <PinnedData open={savedOpen} setSavedOpen={setSavedOpen} />
        </Right> */}
        <Footer />
      </ContentWrapper>
    </>
  )
}

const BLOCK_DIFFERENCE_THRESHOLD = 30

function App() {
  const [savedOpen, setSavedOpen] = useState(false)

  const globalData = useGlobalData()
  const globalChartData = useGlobalChartData()
  const [latestBlock, headBlock] = useLatestBlocks()

  // show warning
  const showWarning = headBlock && latestBlock ? headBlock - latestBlock > BLOCK_DIFFERENCE_THRESHOLD : false

  return (
    <ApolloProvider client={client}>
      <AppWrapper>
        {showWarning && (
          <WarningWrapper>
            <WarningBanner>
              {`Warning: The data on this site has only synced to Ethereum block ${latestBlock} (out of ${headBlock}). Please check back soon.`}
            </WarningBanner>
          </WarningWrapper>
        )}
        {globalData &&
        Object.keys(globalData).length > 0 &&
        globalChartData &&
        Object.keys(globalChartData).length > 0 ? (
          <BrowserRouter>
            <Route component={GoogleAnalyticsReporter} />
            <Switch>
              {/* <Route
                exacts
                strict
                path="/token/:tokenAddress"
                render={({ match }) => {
                  if (
                    isAddress(match.params.tokenAddress.toLowerCase()) &&
                    !Object.keys(TOKEN_BLACKLIST).includes(match.params.tokenAddress.toLowerCase())
                  ) {
                    return (
                      <LayoutWrapper savedOpen={savedOpen} setSavedOpen={setSavedOpen}>
                        <TokenPage address={match.params.tokenAddress.toLowerCase()} />
                      </LayoutWrapper>
                    )
                  } else {
                    return <Redirect to="/home" />
                  }
                }}
              /> */}
              <Route
                exacts
                strict
                path="/pair/:pairAddress"
                render={({ match }) => {
                  if (
                    isAddress(match.params.pairAddress.toLowerCase()) &&
                    !Object.keys(PAIR_BLACKLIST).includes(match.params.pairAddress.toLowerCase())
                  ) {
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

              <Route path="/pools">
                <LayoutWrapper savedOpen={savedOpen} setSavedOpen={setSavedOpen}>
                  <AllPairsPage />
                </LayoutWrapper>
              </Route>

              {/* <Route path="/accounts">
                <LayoutWrapper savedOpen={savedOpen} setSavedOpen={setSavedOpen}>
                  <AccountLookup />
                </LayoutWrapper>
              </Route> */}

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
