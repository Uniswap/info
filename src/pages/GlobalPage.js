import React, { useEffect } from 'react'
import { useParams, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { AutoRow, RowBetween } from '../components/Row'
import { AutoColumn } from '../components/Column'
import PairList from '../components/PairList'
import TopTokenList from '../components/TokenList'
import TxnList from '../components/TxnList'
import GlobalChart from '../components/GlobalChart'
import Search from '../components/Search'
import GlobalStats from '../components/GlobalStats'

import { useGlobalTransactions } from '../contexts/GlobalData'
import { useAllPairData } from '../contexts/PairData'
import { useMedia } from 'react-use'
import Panel from '../components/Panel'
import { useAllTokenData } from '../contexts/TokenData'
import { TYPE, ThemedBackground } from '../Theme'
import { transparentize } from 'polished'
import { CustomLink } from '../components/Link'

import { PageWrapper, ContentWrapper } from '../components'
import useTheme from '../hooks/useTheme'
import { Flex } from 'rebass'

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
  gap: 20px;
  align-items: start;
  justify-content: space-between;

  @media screen and (max-width: 1000px) {
    grid-template-columns: 1fr;
  }
`

const WrappedPanel = styled(Panel)`
  padding: 0;
`

function GlobalPage() {
  // get data for lists and totals
  const allPairs = useAllPairData()
  const allTokens = useAllTokenData()
  const transactions = useGlobalTransactions()
  const theme = useTheme()
  const { network: currentNetworkURL } = useParams()
  const prefixNetworkURL = currentNetworkURL ? `/${currentNetworkURL}` : ''

  // breakpoints
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
      <ThemedBackground backgroundColor={transparentize(0.8, theme.primary)} />
      <ContentWrapper>
        <div>
          <AutoColumn gap='24px' style={{ paddingBottom: below800 ? '12px' : '24px' }}>
            <Flex
              alignItems={below800 ? 'flex-start' : 'center'}
              justifyContent='space-between'
              flexDirection={below800 ? 'column-reverse' : 'row'}
            >
              <TYPE.largeHeader style={{ marginTop: below800 ? '20px' : '0' }}>Summary</TYPE.largeHeader>
              <Search />
            </Flex>
            <GlobalStats />
          </AutoColumn>
          <GridRow>
            <Panel style={{ height: '100%', minHeight: '300px' }}>
              <GlobalChart display='liquidity' />
            </Panel>
            <Panel style={{ height: '100%' }}>
              <GlobalChart display='volume' />
            </Panel>
          </GridRow>
          <ListOptions gap='10px' style={{ marginTop: '2rem', marginBottom: '.5rem' }}>
            <RowBetween>
              <TYPE.main fontSize={'1.125rem'}>Top Tokens</TYPE.main>
              <CustomLink to={prefixNetworkURL + '/tokens'}>See All</CustomLink>
            </RowBetween>
          </ListOptions>
          <WrappedPanel style={{ marginTop: '6px' }}>
            <TopTokenList tokens={allTokens} />
          </WrappedPanel>
          <ListOptions gap='10px' style={{ marginTop: '2rem', marginBottom: '.5rem' }}>
            <RowBetween>
              <TYPE.main fontSize={'1rem'}>Top Pairs</TYPE.main>
              <CustomLink to={prefixNetworkURL + '/pairs'}>See All</CustomLink>
            </RowBetween>
          </ListOptions>
          <WrappedPanel style={{ marginTop: '6px' }}>
            <PairList pairs={allPairs} />
          </WrappedPanel>

          <span>
            <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '2rem' }}>
              Latest Transactions
            </TYPE.main>
          </span>
          <WrappedPanel style={{ margin: '1rem 0' }}>
            <TxnList transactions={transactions} />
          </WrappedPanel>
        </div>
      </ContentWrapper>
    </PageWrapper>
  )
}

export default withRouter(GlobalPage)
