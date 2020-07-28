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
import { useGlobalData, useGlobalTransactions } from '../contexts/GlobalData'
import { useAllPairData } from '../contexts/PairData'
import { useMedia } from 'react-use'
import Panel from '../components/Panel'
import { useAllTokenData } from '../contexts/TokenData'
import { TYPE } from '../Theme'
import { formattedNum, formattedPercent } from '../utils'
import { CustomLink } from '../components/Link'
import Search from '../components/Search'

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* width: calc(100% - 64px); */

  @media screen and (max-width: 1180px) {
    width: calc(100% - 40px);
    padding: 0 20px;
    grid-template-columns: 180px 1fr;
  }

  @media screen and (max-width: 800px) {
    width: calc(100% - 40px);
    padding: 0 20px;
    grid-template-columns: 1fr;
  }
`

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

const ChartWrapper = styled.div`
  height: 100%;
`

const FixedMenu = styled.div`
  width: 100%;
  z-index: 99;
  position: sticky;
  top: -6rem;
  padding-top: 1.5rem;
  background-color: white;
  border-bottom: 1px solid ${({ theme }) => theme.bg3};
  margin-bottom: 2rem;
`

function GlobalPage() {
  const transactions = useGlobalTransactions()

  const allPairs = useAllPairData()
  const allTokens = useAllTokenData()

  const below800 = useMedia('(max-width: 800px)')

  const { totalLiquidityUSD, oneDayVolumeUSD, volumeChangeUSD, liquidityChangeUSD } = useGlobalData()

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

  const handleScroll = ref => {
    console.log(ref.current)
    setActive(ref.current)
    window.scrollTo({
      behavior: 'smooth',
      top: ref.current.offsetTop - 130
    })
  }

  return (
    <PageWrapper>
      <FixedMenu>
        <AutoColumn gap="40px">
          <Search />
          <RowBetween>
            <TYPE.largeHeader>Uniswap Protocol Analytics</TYPE.largeHeader>
            <div />
          </RowBetween>
          <AutoRow gap="1rem" style={{ marginBottom: '1rem' }}>
            <TYPE.main fontSize={'.825rem'} onClick={() => handleScroll(OverviewRef)}>
              Charts
            </TYPE.main>
            <TYPE.main fontSize={'.825rem'} onClick={() => handleScroll(PairsRef)}>
              Top Pairs
            </TYPE.main>
            <TYPE.main fontSize={'.825rem'} onClick={() => handleScroll(TokensRef)}>
              Top Tokens
            </TYPE.main>
            <TYPE.main fontSize={'.825rem'} onClick={() => handleScroll(TransactionsRef)}>
              Transactions
            </TYPE.main>
          </AutoRow>
        </AutoColumn>
      </FixedMenu>
      <span ref={OverviewRef}></span>
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
        <GridRow style={{ marginTop: '6px' }}>
          <Panel style={{ height: '100%', minHeight: '300px' }}>
            <ChartWrapper area="fill" rounded>
              <GlobalChart display="liquidity" />
            </ChartWrapper>
          </Panel>
          <Panel style={{ height: '100%' }}>
            <ChartWrapper area="fill" rounded>
              <GlobalChart display="volume" />
            </ChartWrapper>
          </Panel>
        </GridRow>
      )}
      {below800 && (
        <AutoColumn style={{ marginTop: '6px' }} gap="24px">
          <Panel style={{ height: '100%', minHeight: '300px' }}>
            <ChartWrapper area="fill" rounded>
              <GlobalChart display="liquidity" />
            </ChartWrapper>
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
    </PageWrapper>
  )
}

export default withRouter(GlobalPage)
