import React, { useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { Box } from 'rebass'
import styled from 'styled-components/macro'

import { AutoRow, RowBetween } from '../components/Row'
import { AutoColumn } from '../components/Column'
import PairList from '../components/PairList'
import TopTokenList from '../components/TokenList'
import TxnList from '../components/TxnList'
import GlobalChart from '../components/GlobalChart'
import Search from '../components/Search'
import GlobalStats from '../components/GlobalStats'

import { useGlobalData, useGlobalTransactions } from '../contexts/GlobalData'
import { useAllPairData } from '../contexts/PairData'
import { useMedia } from 'react-use'
import Panel from '../components/Panel'
import { useAllTokenData } from '../contexts/TokenData'
import { formattedNum, formattedPercent } from '../utils'
import { DashboardWrapper, TYPE } from '../Theme'
import { CustomLink } from '../components/Link'

import { PageWrapper, ContentWrapper } from '../components'

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
  const below440 = useMedia('(max-width: 440px)')
  const below800 = useMedia('(max-width: 800px)')

  // scrolling refs

  useEffect(() => {
    document.querySelector('body').scrollTo({
      behavior: 'smooth',
      top: 0,
    })
  }, [])

  return (
    <PageWrapper>
      <ContentWrapper>
        <div>
          <DashboardWrapper>
            <AutoColumn gap={below440 ? '.75rem' : '1.5rem'} style={{ paddingBottom: below800 ? '0' : '24px' }}>
              <RowBetween>
                <TYPE.largeHeader>{below800 ? 'Protocol Analytics' : 'WhiteSwap Protocol Analytics'}</TYPE.largeHeader>
                {!below800 && <Search small={true} />}
              </RowBetween>
              <GlobalStats />
            </AutoColumn>
            {below800 && ( // mobile card
              <Panel
                style={{
                  marginBottom: '1.5rem'
                }}
              >
                <AutoColumn gap={'2.25rem'}>
                  <AutoColumn gap="1rem">
                    <RowBetween>
                      <TYPE.light>Volume (24hrs)</TYPE.light>
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <TYPE.main fontSize={below440 ? '1.25rem' : '1.5rem'} lineHeight={1} fontWeight={600}>
                        {formattedNum(oneDayVolumeUSD, true)}
                      </TYPE.main>
                      <TYPE.main fontSize={12}>{formattedPercent(volumeChangeUSD)}</TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                  <AutoColumn gap="1rem">
                    <RowBetween>
                      <TYPE.light>Total Liquidity</TYPE.light>
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <TYPE.main fontSize={below440 ? '1.25rem' : '1.5rem'}  lineHeight={1} fontWeight={600}>
                        {formattedNum(totalLiquidityUSD, true)}
                      </TYPE.main>
                      <TYPE.main fontSize={12}>{formattedPercent(liquidityChangeUSD)}</TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </AutoColumn>
              </Panel>
            )}
            {!below800 && (
              <GridRow>
                <GlobalChart display="liquidity" />
                <GlobalChart display="volume" />
              </GridRow>
            )}
            {below800 && (
              <AutoColumn style={{ marginTop: '6px' }} gap="24px">
                {/* <Panel style={{ height: '100%', minHeight: '300px' }}> */}
                  <GlobalChart display="liquidity" />
                {/* </Panel> */}
              </AutoColumn>
            )}
          </DashboardWrapper>

          <DashboardWrapper style={{ marginTop: '1rem' }}>
            <ListOptions gap="10px" style={{ marginBottom: '.5rem' }}>
              <RowBetween>
                <TYPE.main fontSize={22} fontWeight={500}>Top Tokens</TYPE.main>
                <CustomLink to={'/tokens'}>See All</CustomLink>
              </RowBetween>
            </ListOptions>
            <TopTokenList tokens={allTokens} />
          </DashboardWrapper>

          <DashboardWrapper style={{ marginTop: '1rem' }}>
            <ListOptions gap="10px" style={{ marginBottom: '.5rem' }}>
              <RowBetween>
                <TYPE.main fontSize={22} fontWeight={500}>Top Pairs</TYPE.main>
                <CustomLink to={'/pairs'}>See All</CustomLink>
              </RowBetween>
            </ListOptions>
            <PairList pairs={allPairs} />
          </DashboardWrapper>

          <DashboardWrapper style={{ marginTop: '1rem' }}>
            <TYPE.main fontSize={22} fontWeight={500}>
              Transactions
            </TYPE.main>
            <TxnList transactions={transactions} />
          </DashboardWrapper>
        </div>
      </ContentWrapper>
    </PageWrapper>
  )
}

export default withRouter(GlobalPage)
