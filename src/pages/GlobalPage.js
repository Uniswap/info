import React, { useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { AutoRow, RowBetween } from '../components/Row'
import { AutoColumn } from '../components/Column'
import TopTokenList from '../components/TokenList'
import TxnList from '../components/TxnList'
import GlobalChart from '../components/GlobalChart'
import GlobalStats from '../components/GlobalStats'

import { useHistory } from '../contexts/History'
import { useMedia } from 'react-use'
import Panel from '../components/Panel'
import { TYPE, ThemedBackground } from '../Theme'
import { transparentize } from 'polished'
import { CustomLink } from '../components/Link'

import { PageWrapper, ContentWrapper } from '../components'
import { useAllTokens } from '../contexts/TokenData'

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
  grid-template-columns: 1fr;
  column-gap: 6px;
  align-items: start;
  justify-content: space-between;
`

function GlobalPage() {
  // get data for lists and totals
  // const allPairs = useAllPairData();
  const tokens = useAllTokens()

  const history = useHistory()

  // breakpoints
  const below800 = useMedia('(max-width: 800px)')

  // scrolling refs

  useEffect(() => {
    document.querySelector('body').scrollTo({
      behavior: 'smooth',
      top: 0
    })
  }, [])

  return (
    <PageWrapper>
      <ThemedBackground backgroundColor={transparentize(0.8, '#ff007a')} />
      <ContentWrapper>
        <div>
          <AutoColumn gap="24px" style={{ paddingBottom: below800 ? '0' : '24px' }}>
            <TYPE.largeHeader>{below800 ? 'Protocol Analytics' : 'JellySwap Protocol Analytics'}</TYPE.largeHeader>
            <GlobalStats />
          </AutoColumn>
          {!below800 && (
            <GridRow>
              <Panel style={{ height: '100%', minHeight: '300px' }}>
                <GlobalChart display="liquidity" />
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

          <ListOptions gap="10px" style={{ marginTop: '2rem', marginBottom: '.5rem' }}>
            <RowBetween>
              <TYPE.main fontSize={'1.125rem'}>Top Assets</TYPE.main>
              <CustomLink to={'/assets'}>See All</CustomLink>
            </RowBetween>
          </ListOptions>
          <Panel style={{ marginTop: '6px', padding: '1.125rem 0 ' }}>
            <TopTokenList tokens={Object.values(tokens)} />
          </Panel>

          <span>
            <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '2rem' }}>
              Transactions
            </TYPE.main>
          </span>

          <Panel style={{ margin: '1rem 0' }}>
            <TxnList history={history} />
          </Panel>
        </div>
      </ContentWrapper>
    </PageWrapper>
  )
}

export default withRouter(GlobalPage)
