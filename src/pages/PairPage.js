import React from 'react'
import 'feather-icons'
import styled from 'styled-components'

import { Text } from 'rebass'
import Panel from '../components/Panel'
// import TokenLogo from '../components/TokenLogo'

import { AutoRow, RowBetween, RowFixed } from '../components/Row'
import Column, { AutoColumn } from '../components/Column'
import { ButtonLight, ButtonDark } from '../components/ButtonStyled'
import PairChart from '../components/PairChart'
import Link from '../components/Link'
import TxnList from '../components/TxnList'
import Loader from '../components/Loader'

import { formattedNum, formattedPercent } from '../helpers'
import { useColor } from '../hooks'
import { usePairData, usePairTransactions, usePairChartData } from '../contexts/PairData'
import { ThemedBackground, TYPE } from '../Theme'
import CopyHelper from '../components/Copy'
import { useMedia } from 'react-use'
import DoubleTokenLogo from '../components/DoubleLogo'
import { transparentize } from 'polished'

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 100px;
  width: calc(100% - 80px);
  padding: 0 40px;
  overflow: scroll;
  padding-bottom: 80px;

  @media screen and (max-width: 640px) {
    width: calc(100% - 40px);
    padding: 0 20px;
  }

  & > * {
    width: 100%;
    max-width: 1240px;
  }
`

const DashboardWrapper = styled.div`
  width: 100%;
`

const PanelWrapper = styled.div`
  grid-template-columns: repeat(4, 1fr);
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

const TokenWrapper = styled.div`
  grid-template-columns: repeat(2, 1fr);
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

const TokenDetailsLayout = styled.div`
  display: inline-grid;
  width: 100%;
  grid-template-columns: auto auto auto auto 1fr;
  column-gap: 30px;
  align-items: start;

  &:last-child {
    align-items: center;
    justify-items: end;
  }
  @media screen and (max-width: 1024px) {
    grid-template-columns: 1fr;
    align-items: stretch;
    > * {
      grid-column: 1 / 4;
      margin-bottom: 1rem;
    }

    &:last-child {
      align-items: start;
      justify-items: start;
    }
  }
`

function PairPage({ pairAddress }) {
  const {
    token0,
    token1,
    reserve0,
    reserve1,
    reserveUSD,
    oneDayVolumeUSD,
    volumeChangeUSD,
    liquidityChangeUSD
  } = usePairData(pairAddress)
  const chartData = usePairChartData(pairAddress)
  const transactions = usePairTransactions(pairAddress)

  const backgroundColor = useColor(pairAddress)

  const liquidity = reserveUSD ? formattedNum(reserveUSD, true) : '-'

  const liquidityChange = liquidityChangeUSD ? formattedPercent(liquidityChangeUSD) : ''

  const volume = oneDayVolumeUSD ? formattedNum(oneDayVolumeUSD, true) : '-'

  const volumeChange = volumeChangeUSD ? formattedPercent(volumeChangeUSD) : ''

  const below1080 = useMedia('(max-width: 1080px)')

  return (
    <PageWrapper>
      <ThemedBackground backgroundColor={transparentize(0.6, backgroundColor)} />
      <RowBetween mt={20} style={{ flexWrap: 'wrap' }}>
        <RowFixed style={{ flexWrap: 'wrap' }}>
          <RowFixed mb={20}>
            {token0 && token1 && (
              <DoubleTokenLogo a0={token0?.id || ''} a1={token1?.id || ''} size={32} margin={true} />
            )}{' '}
            <Text fontSize={'2rem'} fontWeight={600} style={{ margin: '0 1rem' }}>
              {token0 && token1 ? token0.symbol + '-' + token1.symbol + ' Pair' : ''}
            </Text>{' '}
          </RowFixed>
        </RowFixed>
        <span>
          <RowFixed mb={20} ml={'2.5rem'} style={{ flexDirection: below1080 ? 'row-reverse' : 'initial' }}>
            <ButtonLight color={backgroundColor}>+ Add Liquidity</ButtonLight>
            <ButtonDark ml={'.5rem'} mr={below1080 && '.5rem'} color={backgroundColor}>
              Trade
            </ButtonDark>
          </RowFixed>
        </span>
      </RowBetween>

      <DashboardWrapper>
        <>
          {!below1080 && (
            <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '2rem' }}>
              Pair Stats
            </TYPE.main>
          )}
          <PanelWrapper style={{ marginTop: '1.5rem' }}>
            <Panel>
              <AutoColumn gap="20px">
                <RowBetween>
                  <TYPE.main>Total Liquidity</TYPE.main>
                  <div />
                </RowBetween>
                <RowBetween align="flex-end">
                  <TYPE.main fontSize={'2rem'} lineHeight={1} fontWeight={600}>
                    {liquidity}
                  </TYPE.main>
                  <TYPE.main>{liquidityChange}</TYPE.main>
                </RowBetween>
              </AutoColumn>
            </Panel>
            <Panel>
              <AutoColumn gap="20px">
                <RowBetween>
                  <TYPE.main>Volume (24hrs)</TYPE.main>
                  <div />
                </RowBetween>
                <RowBetween align="flex-end">
                  <TYPE.main fontSize={'2rem'} lineHeight={1} fontWeight={600}>
                    {volume}
                  </TYPE.main>
                  <TYPE.main>{volumeChange}</TYPE.main>
                </RowBetween>
              </AutoColumn>
            </Panel>

            <Panel style={{ gridColumn: below1080 ? '1' : '2/6', gridRow: below1080 ? '' : '1/4' }}>
              <PairChart chartData={chartData} color={backgroundColor} />
            </Panel>
          </PanelWrapper>
          <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '3rem' }}>
            Pooled Tokens
          </TYPE.main>{' '}
          <TokenWrapper style={{ marginTop: '1.5rem' }}>
            <Panel>
              <AutoColumn gap="4px">
                <RowBetween>
                  <TYPE.main>{token0 ? token0.symbol + ' balance' : ''}</TYPE.main>
                  <div />
                </RowBetween>
                <RowBetween align="flex-end">
                  <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                    {/* <TokenLogo address={token0?.id} size="24px" style={{ alignSelf: 'center' }} /> */}
                    {reserve0 ? formattedNum(reserve0) : ''}
                  </TYPE.main>
                  <ButtonLight color={backgroundColor}>
                    <Link color={backgroundColor}>View Token</Link>
                  </ButtonLight>{' '}
                </RowBetween>
              </AutoColumn>
            </Panel>
            <Panel>
              <AutoColumn gap="4px">
                <RowBetween>
                  <TYPE.main>{token1 ? token1.symbol + ' balance' : ''}</TYPE.main>
                  <div />
                </RowBetween>
                <RowBetween align="flex-end">
                  <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                    {/* <TokenLogo address={token1?.id} size="24px" style={{ alignSelf: 'center' }} /> */}
                    {reserve1 ? formattedNum(reserve1) : ''}
                  </TYPE.main>
                  <ButtonLight color={backgroundColor}>
                    <Link color={backgroundColor}>View Token</Link>
                  </ButtonLight>{' '}
                </RowBetween>
              </AutoColumn>
            </Panel>
          </TokenWrapper>
          <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '3rem' }}>
            Transactions
          </TYPE.main>{' '}
          <Panel
            style={{
              border: '1px solid rgba(43, 43, 43, 0.05)',
              marginTop: '1.5rem'
            }}
          >
            {transactions ? <TxnList transactions={transactions} /> : <Loader />}
          </Panel>
          <RowBetween style={{ marginTop: '3rem' }}>
            <TYPE.main fontSize={'1.125rem'}>Pair Information</TYPE.main>{' '}
          </RowBetween>
          <Panel
            rounded
            style={{
              border: '1px solid rgba(43, 43, 43, 0.05)',
              marginTop: '1.5rem'
            }}
            p={20}
          >
            <TokenDetailsLayout>
              <Column>
                <TYPE.main>Pair Name</TYPE.main>
                <Text style={{ marginTop: '.5rem' }} fontSize={24} fontWeight="500">
                  {token0 && token1 ? token0.symbol + '-' + token1.symbol : ''}
                </Text>
              </Column>

              <Column>
                <TYPE.main>Pair Address</TYPE.main>
                <AutoRow align="flex-end">
                  <Text style={{ marginTop: '.5rem' }} fontSize={24} fontWeight="500">
                    {pairAddress.slice(0, 6) + '...' + pairAddress.slice(38, 42)}
                  </Text>
                  <CopyHelper toCopy={pairAddress} />
                </AutoRow>
              </Column>

              <Column>
                <TYPE.main>{token0 && token0.symbol + ' Address'}</TYPE.main>
                <AutoRow align="flex-end">
                  <Text style={{ marginTop: '.5rem' }} fontSize={24} fontWeight="500">
                    {token0 && token0.id.slice(0, 6) + '...' + token0.id.slice(38, 42)}
                  </Text>
                  <CopyHelper toCopy={token0?.id} />
                </AutoRow>
              </Column>
              <Column>
                <TYPE.main>{token1 && token1.symbol + ' Address'}</TYPE.main>
                <AutoRow align="flex-end">
                  <Text style={{ marginTop: '.5rem' }} fontSize={24} fontWeight="500">
                    {token1 && token1.id.slice(0, 6) + '...' + token1.id.slice(38, 42)}
                  </Text>
                  <CopyHelper toCopy={token1?.id} />
                </AutoRow>
              </Column>

              <ButtonLight color={backgroundColor}>
                <Link color={backgroundColor} external href={'https://etherscan.io/address/' + pairAddress}>
                  View on Etherscan ↗
                </Link>
              </ButtonLight>
            </TokenDetailsLayout>
          </Panel>
        </>
      </DashboardWrapper>
    </PageWrapper>
  )
}

export default PairPage
