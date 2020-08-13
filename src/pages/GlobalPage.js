import React, { useState, useRef, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { Box } from 'rebass'
import styled from 'styled-components'

import { AutoRow, RowBetween } from '../components/Row'
import { AutoColumn } from '../components/Column'
import PairList from '../components/PairList'
import TopTokenList from '../components/TokenList'
import TxnList from '../components/TxnList'
import GlobalChart from '../components/GlobalChart'
import Search from '../components/Search'
import NavHeader from '../components/NavHeader'

import { useGlobalData, useGlobalTransactions } from '../contexts/GlobalData'
import { useAllPairData } from '../contexts/PairData'
import { useMedia } from 'react-use'
import Panel from '../components/Panel'
import { useAllTokenData } from '../contexts/TokenData'
import { formattedNum, formattedPercent } from '../utils'
import { TYPE, ThemedBackground } from '../Theme'
import { transparentize } from 'polished'
import Link, { CustomLink } from '../components/Link'
import { TrendingUp, PieChart, Disc, List } from 'react-feather'
import { SubNav, SubNavEl, PageWrapper, FixedMenu, ContentWrapper } from '../components'
import { ButtonDark } from '../components/ButtonStyled'

const ListOptions = styled(AutoRow)`
  height: 40px;
  width: 100%;
  font-size: 1.25rem;
  font-weight: 600;

  @media screen and (max-width: 640px) {
    font-size: 1rem;
  }
`

const GridRow = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: 1fr 1fr;
  column-gap: 6px;
  align-items: start;
  justify-content: space-between;
`

function GlobalPage() {
  // get data for lists and totals
  const allPairs = useAllPairData()
  const allTokens = useAllTokenData()
  const transactions = useGlobalTransactions()
  const { totalLiquidityUSD, oneDayVolumeUSD, volumeChangeUSD, liquidityChangeUSD } = useGlobalData()

  // breakpoints
  const below1180 = useMedia('(max-width: 1180px)')
  const below800 = useMedia('(max-width: 800px)')
  const below600 = useMedia('(max-width: 600px)')

  // scrolling refs
  const OverviewRef = useRef()
  const PairsRef = useRef()
  const TokensRef = useRef()
  const TransactionsRef = useRef()
  const [active, setActive] = useState(null)
  useEffect(() => {
    setActive(OverviewRef)
    document.querySelector('body').scrollTo({
      behavior: 'smooth',
      top: 0
    })
  }, [])

  // scroll to ref on click
  const handleScroll = ref => {
    setActive(ref.current)
    window.scrollTo({
      behavior: 'smooth',
      top: ref.current.offsetTop - 180
    })
  }

  return (
    <PageWrapper>
      <ThemedBackground backgroundColor={transparentize(0.8, '#ff007a')} />
      <div ref={OverviewRef} />

      <ContentWrapper>
        <div>
          <AutoColumn gap="24px" style={{ paddingBottom: '24px' }}>
            <TYPE.largeHeader>Uniswap Protocol Overview</TYPE.largeHeader>
            <Search />
            <NavHeader />
          </AutoColumn>

          {below800 && ( // mobile card
            <Box mb={20}>
              <Panel>
                <Box>
                  <AutoColumn gap="36px">
                    <AutoColumn gap="20px">
                      <RowBetween>
                        <TYPE.main>Volume (24hrs)</TYPE.main>
                        <div />
                      </RowBetween>
                      <RowBetween align="flex-end">
                        <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                          {formattedNum(oneDayVolumeUSD, true)}
                        </TYPE.main>
                        <TYPE.main fontSize={12}>{formattedPercent(volumeChangeUSD)}</TYPE.main>
                      </RowBetween>
                    </AutoColumn>
                    <AutoColumn gap="20px">
                      <RowBetween>
                        <TYPE.main>Total Liquidity</TYPE.main>
                        <div />
                      </RowBetween>
                      <RowBetween align="flex-end">
                        <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                          {formattedNum(totalLiquidityUSD, true)}
                        </TYPE.main>
                        <TYPE.main fontSize={12}>{formattedPercent(liquidityChangeUSD)}</TYPE.main>
                      </RowBetween>
                    </AutoColumn>
                  </AutoColumn>
                </Box>
              </Panel>
            </Box>
          )}
          {!below800 && (
            <GridRow>
              <Panel style={{ height: '100%', minHeight: '300px' }}>
                <GlobalChart display="liquidity" />
              </Panel>
              <Panel style={{ height: '100%' }}>
                <GlobalChart display="volume" />
              </Panel>
            </GridRow>
          )}
          {below800 && (
            <AutoColumn style={{ marginTop: '6px' }} gap="24px">
              <Panel style={{ height: '100%', minHeight: '300px' }}>
                <GlobalChart display="liquidity" />
              </Panel>
            </AutoColumn>
          )}
          <ListOptions ref={PairsRef} gap="10px" style={{ marginTop: '2rem', marginBottom: '.5rem' }}>
            <RowBetween>
              <TYPE.main fontSize={'1rem'}>Top Pairs</TYPE.main>
              <CustomLink to={'/all-pairs'}>See All</CustomLink>
            </RowBetween>
          </ListOptions>
          <Panel style={{ marginTop: '6px', padding: '1.125rem 0 ' }}>
            <PairList pairs={allPairs} />
          </Panel>
          <ListOptions ref={TokensRef} gap="10px" style={{ marginTop: '2rem', marginBottom: '.5rem' }}>
            <RowBetween>
              <TYPE.main fontSize={'1.125rem'}>Top Tokens</TYPE.main>
              <CustomLink to={'/all-tokens'}>See All</CustomLink>
            </RowBetween>
          </ListOptions>
          <Panel style={{ marginTop: '6px', padding: '1.125rem 0 ' }}>
            <TopTokenList tokens={allTokens} />
          </Panel>
          <span ref={TransactionsRef}>
            <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '2rem' }}>
              Transactions
            </TYPE.main>
          </span>
          <Panel style={{ margin: '1rem 0' }}>
            <TxnList transactions={transactions} />
          </Panel>
        </div>
      </ContentWrapper>
    </PageWrapper>
  )
}

export default withRouter(GlobalPage)
