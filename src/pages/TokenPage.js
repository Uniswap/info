import React, { useState, useEffect } from 'react'
import 'feather-icons'
import { withRouter } from 'react-router-dom'
import { Text } from 'rebass'
import styled from 'styled-components'
import Panel from '../components/Panel'
import TokenLogo from '../components/TokenLogo'

import Loader from '../components/LocalLoader'
import { AutoRow, RowBetween, RowFixed } from '../components/Row'
import { AutoColumn } from '../components/Column'
import TxnList from '../components/TxnList'
import TokenChart from '../components/TokenChart'
import { BasicLink } from '../components/Link'
import { safeAccess } from '../utils'

import { TYPE, ThemedBackground } from '../Theme'
import { transparentize } from 'polished'

import { useMedia } from 'react-use'

import { PageWrapper, ContentWrapper } from '../components'

import FormattedName from '../components/FormattedName'
import { useToken } from '../contexts/TokenData'
import { useHistoryForAsset } from '../contexts/History'
import { useLiquidityForAsset } from '../contexts/Liquidity'
import { useProviders } from '../contexts/Providers'
import ProvidersList from '../components/ProvidersList'

const DashboardWrapper = styled.div`
  width: 100%;
`

const PanelWrapper = styled.div`
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: max-content;
  gap: 6px;
  display: inline-grid;
  width: 100%;
  align-items: start;
  @media screen and (max-width: 1024px) {
    grid-template-columns: 1fr;
    align-items: stretch;
    > * {
      grid-column: 1 / 4;
    }

    > * {
      &:first-child {
        width: 100%;
      }
    }
  }
`

const WarningGrouping = styled.div`
  opacity: ${({ disabled }) => disabled && '0.4'};
  pointer-events: ${({ disabled }) => disabled && 'none'};
`

function TokenPage({ asset }) {
  useEffect(() => {
    document.querySelector('body').scrollTo(0, 0)
  }, [])
  const [data, setData] = useState([])

  const token = useToken(asset)
  const transactions = useHistoryForAsset(asset)
  const liquidity = useLiquidityForAsset(asset)
  const providers = useProviders()

  useEffect(() => {
    if (!providers) {
      setData([])
      return
    }

    const providersData = []

    Object.keys(providers).forEach(provider => {
      if (safeAccess(providers[provider], ['balances', asset])) {
        const { address, balance } = providers[provider].balances[asset]

        providersData.push({ name: address.slice(0, 5) + '...' + address.slice(-5), value: +balance })
      }
    })

    setData([...providersData])
  }, [providers, asset])

  const { symbol, priceUSD, totalLiquidityUSD } = token

  const below1080 = useMedia('(max-width: 1080px)')

  useEffect(() => {
    window.scrollTo({
      behavior: 'smooth',
      top: 0
    })
  }, [])

  return (
    <PageWrapper>
      <ThemedBackground backgroundColor={transparentize(0.6, '#ff007a')} />

      <ContentWrapper>
        <RowBetween style={{ flexWrap: 'wrap', alingItems: 'start' }}>
          <AutoRow align="flex-end" style={{ width: 'fit-content' }}>
            <TYPE.body>
              <BasicLink to="/assets">{'Assets '}</BasicLink>→ {symbol}
              {'  '}
            </TYPE.body>

            <Text style={{ marginLeft: '.15rem' }} fontSize={'14px'} fontWeight={400}></Text>
          </AutoRow>
        </RowBetween>

        <WarningGrouping>
          <DashboardWrapper style={{ marginTop: below1080 ? '0' : '1rem' }}>
            <RowBetween style={{ flexWrap: 'wrap', marginBottom: '2rem', alignItems: 'flex-start' }}>
              <RowFixed style={{ flexWrap: 'wrap' }}>
                <RowFixed style={{ alignItems: 'baseline' }}>
                  <TokenLogo token={asset} size="32px" style={{ alignSelf: 'center' }} />
                  <TYPE.main fontSize={below1080 ? '1.5rem' : '2rem'} fontWeight={500} style={{ margin: '0 1rem' }}>
                    <RowFixed gap="6px">
                      <FormattedName
                        text={asset ? asset + ' ' : ''}
                        maxCharacters={16}
                        style={{ marginRight: '6px' }}
                      />{' '}
                      {symbol ? `(${symbol})` : ''}
                    </RowFixed>
                  </TYPE.main>{' '}
                  {!below1080 && (
                    <>
                      <TYPE.main fontSize={'1.5rem'} fontWeight={500} style={{ marginRight: '1rem' }}>
                        {priceUSD}
                      </TYPE.main>
                    </>
                  )}
                </RowFixed>
              </RowFixed>
            </RowBetween>

            <>
              <PanelWrapper style={{ marginTop: below1080 ? '0' : '1rem' }}>
                {below1080 && priceUSD && (
                  <Panel>
                    <AutoColumn gap="20px">
                      <RowBetween>
                        <TYPE.main>priceUSD</TYPE.main>
                        <div />
                      </RowBetween>
                      <RowBetween align="flex-end">
                        {' '}
                        <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={500}>
                          {priceUSD}
                        </TYPE.main>
                      </RowBetween>
                    </AutoColumn>
                  </Panel>
                )}
                <Panel>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.main>Total Liquidity</TYPE.main>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={500}>
                        {liquidity}
                      </TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </Panel>
                <Panel>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.main>Total USD</TYPE.main>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={500}>
                        {totalLiquidityUSD.toFixed(2)}
                      </TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </Panel>

                <Panel style={{ gridColumn: below1080 ? '' : '2/4', gridRow: below1080 ? '' : '1/4', width: '100%' }}>
                  <TokenChart data={data} asset={asset} />
                </Panel>
              </PanelWrapper>
            </>

            <RowBetween mt={40} mb={'1rem'}>
              <TYPE.main fontSize={'1.125rem'}>Providers</TYPE.main> <div />
            </RowBetween>
            <Panel rounded>
              {data ? <ProvidersList color={'#ff007a'} providers={data} asset={asset} /> : <Loader />}
            </Panel>

            <RowBetween mt={40} mb={'1rem'}>
              <TYPE.main fontSize={'1.125rem'}>Transactions</TYPE.main> <div />
            </RowBetween>
            <Panel rounded>{transactions ? <TxnList color={'#ff007a'} history={transactions} /> : <Loader />}</Panel>
          </DashboardWrapper>
        </WarningGrouping>
      </ContentWrapper>
    </PageWrapper>
  )
}

export default withRouter(TokenPage)
