import { useState } from 'react'
import styled from 'styled-components/macro'
import { Route, Routes, Navigate } from 'react-router-dom'
import GlobalPage from './pages/GlobalPage'
import TokenPage from './pages/TokenPage'
import PairPage from './pages/PairPage'
import { useGlobalData, useGlobalChartData } from 'state/features/global/hooks'
import { usePairUpdater } from 'state/features/pairs/hooks'
import { useTokenUpdater } from 'contexts/TokenData'
import AccountPage from './pages/AccountPage'
import AllTokensPage from './pages/AllTokensPage'
import AllPairsPage from './pages/AllPairsPage'
import PinnedData from './components/PinnedData'
import { useFormatPath } from './hooks'

import SideNav from './components/SideNav'
import AccountLookup from './pages/AccountLookup'
import LocalLoader from './components/LocalLoader'
import { useLatestBlocks } from 'state/features/application/hooks'

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
  position: fixed;
  right: 0;
  bottom: 0;
  z-index: 9999;
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
  transition: width 0.25s ease;
  background-color: ${({ theme }) => theme.onlyLight};
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

const BLOCK_DIFFERENCE_THRESHOLD = 30

function App() {
  const [savedOpen, setSavedOpen] = useState(false)

  const globalData = useGlobalData()
  const globalChartData = useGlobalChartData()
  const [latestBlock, headBlock] = useLatestBlocks()
  const formatPath = useFormatPath()
  // show warning
  const showWarning = headBlock && latestBlock ? headBlock - latestBlock > BLOCK_DIFFERENCE_THRESHOLD : false

  usePairUpdater()
  useTokenUpdater()

  return (
    <AppWrapper>
      {showWarning && (
        <WarningWrapper>
          <WarningBanner>
            {`Warning: The data on this site has only synced to Ethereum block ${latestBlock} (out of ${headBlock}). Please check back soon.`}
          </WarningBanner>
        </WarningWrapper>
      )}
      {latestBlock &&
      globalData &&
      Object.keys(globalData).length > 0 &&
      globalChartData &&
      Object.keys(globalChartData).length > 0 ? (
        <ContentWrapper open={savedOpen}>
          <SideNav />
          <Center id="center">
            <Routes>
              <Route path="/:networkID" element={<GlobalPage />} />
              <Route path="/:networkID/tokens" element={<AllTokensPage />} />
              <Route path="/:networkID/tokens/:tokenAddress" element={<TokenPage />} />
              <Route path="/:networkID/pairs" element={<AllPairsPage />} />
              <Route path="/:networkID/pairs/:pairAddress" element={<PairPage />} />
              <Route path="/:networkID/accounts" element={<AccountLookup />} />
              <Route path="/:networkID/accounts/:accountAddress" element={<AccountPage />} />
              <Route path="*" element={<Navigate to={formatPath('/')} replace />} />
            </Routes>
          </Center>
          <Right open={savedOpen}>
            <PinnedData open={savedOpen} setSavedOpen={setSavedOpen} />
          </Right>
        </ContentWrapper>
      ) : (
        <LocalLoader fill="true" />
      )}
    </AppWrapper>
  )
}

export default App
