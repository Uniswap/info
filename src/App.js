import React from 'react'
import styled from 'styled-components'
import { Route, Switch, BrowserRouter, Redirect } from 'react-router-dom'
import GlobalPage from './pages/GlobalPage'
import TokenPage from './pages/TokenPage'
import AllTokensPage from './pages/AllTokensPage'

import SideNav from './components/SideNav'
import LocalLoader from './components/LocalLoader'
import { useLiquidityChart } from './contexts/LiquidityChart'
import { useLiquidity } from './contexts/Liquidity'
import { useAllPrices } from './contexts/Price'
import RewardsPage from './pages/RewardsPage'
import { useTotalLiquidity } from './contexts/TokenData'
import { useRewards } from './contexts/Rewards'

const AppWrapper = styled.div`
  position: relative;
  width: 100%;
`

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 220px 1fr;

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

const Center = styled.div`
  height: 100%;
  z-index: 9999;
  transition: width 0.25s ease;
  background-color: ${({ theme }) => theme.onlyLight};
`

/**
 * Wrap the component with the header and sidebar pinned tab
 */
const LayoutWrapper = ({ children, savedOpen, setSavedOpen }) => {
  return (
    <>
      <ContentWrapper>
        <SideNav />
        <Center id="center">{children}</Center>
      </ContentWrapper>
    </>
  )
}

function App() {
  // const globalData = useGlobalData()
  const globalChartData = useLiquidityChart()
  const liquidityData = useLiquidity()
  const prices = useAllPrices()
  const totalLiquidity = useTotalLiquidity()
  const rewards = useRewards()

  return (
    <AppWrapper>
      {rewards &&
      totalLiquidity &&
      liquidityData &&
      prices &&
      globalChartData &&
      Object.keys(globalChartData).length > 0 ? (
        <BrowserRouter>
          <Switch>
            <Route
              exacts
              strict
              path="/asset/:asset"
              render={({ match }) => {
                return (
                  <LayoutWrapper>
                    <TokenPage asset={match.params.asset} />
                  </LayoutWrapper>
                )
              }}
            />

            <Route path="/home">
              <LayoutWrapper>
                <GlobalPage />
              </LayoutWrapper>
            </Route>

            <Route path="/assets">
              <LayoutWrapper>
                <AllTokensPage />
              </LayoutWrapper>
            </Route>

            <Route path="/rewards">
              <LayoutWrapper>
                <RewardsPage />
              </LayoutWrapper>
            </Route>

            <Redirect to="/home" />
          </Switch>
        </BrowserRouter>
      ) : (
        <LocalLoader fill="true" />
      )}
    </AppWrapper>
  )
}

export default App
