import React, { useEffect, useState } from 'react'
import { Route, Switch, BrowserRouter, Redirect, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Text } from 'rebass'

import GlobalPage from './pages/GlobalPage'
import TokenPage from './pages/TokenPage'
import PairPage from './pages/PairPage'
import PoolPage from './pages/PoolPage'
import { useGlobalData, useGlobalChartData } from './contexts/GlobalData'
import { isAddress } from './utils'
import AccountPage from './pages/AccountPage'
import AllTokensPage from './pages/AllTokensPage'
import AllPairsPage from './pages/AllPairsPage'
import PinnedData from './components/PinnedData'
import SideNav from './components/SideNav'
import AccountLookup from './pages/AccountLookup'
import { OVERVIEW_TOKEN_BLACKLIST, PAIR_BLACKLIST } from './constants'
import LocalLoader from './components/LocalLoader'
import { ButtonDark } from './components/ButtonStyled'
import { useLatestBlocks } from './contexts/Application'
import useTheme from './hooks/useTheme'
import BottomBar from './components/BottomBar'
import KyberSwapAnounce from './components/KyberSwapAnnounce'
import { useNetworksInfo } from './contexts/NetworkInfo'
import { ChainId, NETWORKS_INFO_LIST } from './constants/networks'

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
  min-height: 100vh;
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
  border-bottom: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.buttonBlack};
  padding: 1.5rem 2.5rem;
  color: ${({ theme }) => theme.subText};
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

function AppLogicWrapper(props) {
  const theme = useTheme()
  const [networksInfo] = useNetworksInfo()
  const globalData = useGlobalData()
  const globalChartData = useGlobalChartData()
  const [latestBlocks, headBlocks] = useLatestBlocks()

  const [dismissed, markAsDismissed] = useState(false)

  // show warning
  const BLOCK_DIFFERENCE_THRESHOLD = !networksInfo.slice(1).some(Boolean) && networksInfo[0].chainId === ChainId.MATIC ? 210 : 30
  const showWarning = networksInfo
    .map((networkInfo, i) =>
      headBlocks[i] && latestBlocks[i]
        ? headBlocks[i] - latestBlocks[i] > BLOCK_DIFFERENCE_THRESHOLD && {
            networkInfo,
            latestBlock: latestBlocks[i],
            headBlock: headBlocks[i],
          }
        : false
    )
    .find(Boolean)
  return (
    <AppWrapper>
      {!dismissed && showWarning && (
        <WarningWrapper>
          <WarningBanner>
            <div>
              <Text fontWeight={500} fontSize={14} color={'#ffaf01'} style={{ display: 'inline' }} mr={'8px'}>
                Warning:
              </Text>
              {`The data on this site has only synced to ${showWarning.networkInfo.name} block ${showWarning.latestBlock} (out of ${showWarning.headBlock}). Please check back soon.`}
            </div>

            <CloseButtonWrapper>
              <ButtonDark color={theme.primary} style={{ minWidth: '140px' }} onClick={() => markAsDismissed(true)}>
                Close
              </ButtonDark>
            </CloseButtonWrapper>
          </WarningBanner>
        </WarningWrapper>
      )}
      {props.children}
    </AppWrapper>
  )
}

/**
 * Wrap the component with the header and sidebar pinned tab
 * And read network params from url, then validate it
 */
const LayoutWrapper = props => {
  const { network: currentNetworkURL } = useParams()
  const [, updateChain] = useNetworksInfo()
  let networkInfoFromURL = NETWORKS_INFO_LIST.find(networkInfo => networkInfo.urlKey === currentNetworkURL)

  useEffect(() => {
    if (!currentNetworkURL) {
      updateChain('allchain')
    } else if (networkInfoFromURL) {
      updateChain(networkInfoFromURL.chainId || 'allchain')
    }
  }, [currentNetworkURL, networkInfoFromURL, updateChain])
  if (currentNetworkURL && !networkInfoFromURL) return <Redirect to='/home' />
  return (
    <AppLogicWrapper>
      <KyberSwapAnounce />
      <ContentWrapper open={props.savedOpen}>
        <SideNav />
        <BottomBar />
        <Center id='center'>
          {props.children}
          <Marginer />
        </Center>
        <Right open={props.savedOpen}>
          <PinnedData open={props.savedOpen} setSavedOpen={props.setSavedOpen} />
        </Right>
      </ContentWrapper>
    </AppLogicWrapper>
  )
}

function App() {
  const [savedOpen, setSavedOpen] = useState(false)

  return (
    <BrowserRouter basename='/classic'>
      <Switch>
        <Route
          exacts
          strict
          path='/:network?/token/:tokenAddress'
          render={({ match }) => {
            if (OVERVIEW_TOKEN_BLACKLIST.includes(match.params.tokenAddress.toLowerCase())) {
              return <Redirect to={`/${match.params.network}/home`} />
            }
            return (
              <LayoutWrapper savedOpen={savedOpen} setSavedOpen={setSavedOpen}>
                <TokenPage address={match.params.tokenAddress.toLowerCase()} />
              </LayoutWrapper>
            )
          }}
        />

        <Route
          exacts
          strict
          path='/:network?/pair/:pairAddress'
          render={({ match }) => {
            if (PAIR_BLACKLIST.includes(match.params.pairAddress.toLowerCase())) {
              return <Redirect to={`/${match.params.network}/home`} />
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
          path='/:network?/pool/:poolAddress'
          render={({ match }) => {
            if (PAIR_BLACKLIST.includes(match.params.poolAddress.toLowerCase())) {
              return <Redirect to={`/${match.params.network}/home`} />
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
          path='/:network?/account/:accountAddress'
          render={({ match }) => {
            if (isAddress(match.params.accountAddress.toLowerCase())) {
              return (
                <LayoutWrapper savedOpen={savedOpen} setSavedOpen={setSavedOpen}>
                  <AccountPage account={match.params.accountAddress.toLowerCase()} />
                </LayoutWrapper>
              )
            }
            return <Redirect to={`/${match.params.network}/home`} />
          }}
        />

        <Route
          path='/:network?/home'
          render={() => (
            <LayoutWrapper savedOpen={savedOpen} setSavedOpen={setSavedOpen}>
              <GlobalPage />
            </LayoutWrapper>
          )}
        />
        <Route
          path='/:network?/tokens'
          render={() => (
            <LayoutWrapper savedOpen={savedOpen} setSavedOpen={setSavedOpen}>
              <AllTokensPage />
            </LayoutWrapper>
          )}
        />
        <Route
          path='/:network?/pairs'
          render={() => (
            <LayoutWrapper savedOpen={savedOpen} setSavedOpen={setSavedOpen}>
              <AllPairsPage />
            </LayoutWrapper>
          )}
        />
        <Route
          path='/:network/accounts'
          render={() => (
            <LayoutWrapper savedOpen={savedOpen} setSavedOpen={setSavedOpen}>
              <AccountLookup />
            </LayoutWrapper>
          )}
        />
        <Route path='/:network' render={() => <RedirectToHome />} />
        <Route path='*' render={() => <RedirectToHome />} />
      </Switch>
    </BrowserRouter>
  )
}

const RedirectToHome = () => {
  const { network: currentNetworkURL } = useParams()
  const prefixNetworkURL = currentNetworkURL ? `/${currentNetworkURL}` : ''

  return <Redirect to={prefixNetworkURL + '/home'} />
}

export default App
