import React from 'react'
import 'feather-icons'
import { withRouter } from 'react-router-dom'
import { Text } from 'rebass'
import styled from 'styled-components'

import Link from '../components/Link'
import Panel from '../components/Panel'
import TokenLogo from '../components/TokenLogo'
import PairList from '../components/PairList'
import Loader from '../components/Loader'
import { AutoRow, RowBetween, RowFixed } from '../components/Row'
import Column, { AutoColumn } from '../components/Column'
import { ButtonLight, ButtonDark } from '../components/ButtonStyled'
import TxnList from '../components/TxnList'
import TokenChart from '../components/TokenChart'

import { formattedNum, formattedPercent, getPoolLink, getSwapLink } from '../helpers'

import { useTokenData, useTokenTransactions } from '../contexts/TokenData'
import { TYPE, ThemedBackground } from '../Theme'
import { useColor } from '../hooks'
import CopyHelper from '../components/Copy'
import { useMedia } from 'react-use'
import { transparentize } from 'polished'
import { useDataForList } from '../contexts/PairData'
import { useEffect } from 'react'
import Warning from '../components/Warning'
import { SURPRESS_WARNINGS } from '../constants'
import { usePathDismissed } from '../contexts/LocalStorage'

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 100px;
  width: calc(100% - 80px);
  padding: 0 40px;

  padding-bottom: 80px;

  @media screen and (max-width: 640px) {
    width: calc(100% - 40px);
    padding: 0 20px;
  }

  & > * {
    width: 90%;
    max-width: 1240px;
  }
`

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

const TokenDetailsLayout = styled.div`
  display: inline-grid;
  width: 100%;
  grid-template-columns: auto auto auto 1fr;
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

const WarningGrouping = styled.div`
  opacity: ${({ disabled }) => disabled && '0.4'};
  pointer-events: ${({ disabled }) => disabled && 'none'};
`

function TokenPage({ address, history }) {
  const {
    id,
    name,
    symbol,
    priceUSD,
    allPairs,
    oneDayVolumeUSD,
    totalLiquidityUSD,
    volumeChangeUSD,
    priceChangeUSD,
    liquidityChangeUSD,
    oneDayTxns,
    txnChange
  } = useTokenData(address)

  useEffect(() => {
    document.querySelector('body').scrollTo(0, 0)
  }, [])

  // detect color from token
  const backgroundColor = useColor(id, symbol)

  // pairs to show in pair list
  const fetchedPairsList = useDataForList(allPairs)

  // all transactions with this token
  const transactions = useTokenTransactions(address)

  // price
  const price = priceUSD ? formattedNum(priceUSD, true) : ''
  const priceChange = priceChangeUSD ? formattedPercent(priceChangeUSD) : ''

  // volume

  const volume = oneDayVolumeUSD ? formattedNum(oneDayVolumeUSD, true) : oneDayVolumeUSD === 0 ? '$0' : ''
  const volumeChange = formattedPercent(volumeChangeUSD)

  // liquidity
  const liquidity = totalLiquidityUSD ? formattedNum(totalLiquidityUSD, true) : totalLiquidityUSD === 0 ? '$0' : ''
  const liquidityChange = formattedPercent(liquidityChangeUSD)

  // transactions
  const txnChangeFormatted = formattedPercent(txnChange)

  const below1080 = useMedia('(max-width: 1080px)')
  const below600 = useMedia('(max-width: 600px)')

  const [dismissed, markAsDismissed] = usePathDismissed(history.location.pathname)

  return (
    <PageWrapper>
      <ThemedBackground backgroundColor={transparentize(0.6, backgroundColor)} />
      <Warning
        type={'token'}
        show={!dismissed && !SURPRESS_WARNINGS.includes(address)}
        setShow={markAsDismissed}
        address={address}
      />
      <WarningGrouping disabled={!dismissed && !SURPRESS_WARNINGS.includes(address)}>
        <RowBetween mt={20} style={{ flexWrap: 'wrap' }}>
          <RowFixed style={{ flexWrap: 'wrap' }}>
            <RowFixed mb={20} style={{ alignItems: 'baseline' }}>
              <TokenLogo address={address} size="32px" style={{ alignSelf: 'center' }} />
              <Text fontSize={'2rem'} fontWeight={600} style={{ margin: '0 1rem' }}>
                {name ? name + ' ' : ''} {symbol ? '(' + symbol + ')' : ''}
              </Text>{' '}
              {!below1080 && (
                <>
                  <Text fontSize={'2rem'} fontWeight={500} style={{ marginRight: '1rem' }}>
                    {price}
                  </Text>
                  {priceChange}
                </>
              )}
            </RowFixed>
          </RowFixed>
          <span>
            <RowFixed
              mb={20}
              ml={below600 ? '0' : '2.5rem'}
              style={{ flexDirection: below1080 ? 'row-reverse' : 'initial' }}
            >
              <Link href={getPoolLink(address)} target="_blank">
                <ButtonLight color={backgroundColor}>+ Add Liquidity</ButtonLight>
              </Link>
              <Link href={getSwapLink(address)} target="_blank">
                <ButtonDark ml={'.5rem'} mr={below1080 && '.5rem'} color={backgroundColor}>
                  Trade
                </ButtonDark>
              </Link>
            </RowFixed>
          </span>
        </RowBetween>
        <DashboardWrapper>
          <>
            {!below1080 && (
              <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '2rem' }}>
                Token Stats
              </TYPE.main>
            )}

            <PanelWrapper style={{ marginTop: '1.5rem' }}>
              {below1080 && (
                <Panel>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.main>Price</TYPE.main>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      {' '}
                      <TYPE.main fontSize={'2rem'} lineHeight={1} fontWeight={600}>
                        {price}
                      </TYPE.main>
                      <TYPE.main>{priceChange}</TYPE.main>
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

              <Panel>
                <AutoColumn gap="20px">
                  <RowBetween>
                    <TYPE.main>Transactions (24hrs)</TYPE.main>
                    <div />
                  </RowBetween>
                  <RowBetween align="flex-end">
                    <TYPE.main fontSize={'2rem'} lineHeight={1} fontWeight={600}>
                      {oneDayTxns}
                    </TYPE.main>
                    <TYPE.main>{txnChangeFormatted}</TYPE.main>
                  </RowBetween>
                </AutoColumn>
              </Panel>
              <Panel style={{ gridColumn: below1080 ? '1' : '2/4', gridRow: below1080 ? '' : '1/4' }}>
                <TokenChart address={address} color={backgroundColor} />
              </Panel>
            </PanelWrapper>
          </>
          <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '3rem' }}>
            Top Pairs
          </TYPE.main>{' '}
          <Panel
            rounded
            style={{
              border: '1px solid rgba(43, 43, 43, 0.05)',
              marginTop: '1.5rem'
            }}
            p={20}
          >
            {address && fetchedPairsList ? (
              <PairList color={backgroundColor} address={address} pairs={fetchedPairsList} />
            ) : (
              <Loader />
            )}
          </Panel>
          <RowBetween mt={40} mb={'1rem'}>
            <TYPE.main fontSize={'1.125rem'}>Transactions</TYPE.main> <div />
          </RowBetween>
          <Panel
            rounded
            style={{
              border: '1px solid rgba(43, 43, 43, 0.05)'
            }}
          >
            {transactions ? <TxnList color={backgroundColor} transactions={transactions} /> : <Loader />}
          </Panel>
          <>
            <RowBetween style={{ marginTop: '3rem' }}>
              <TYPE.main fontSize={'1.125rem'}>Token Information</TYPE.main>{' '}
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
                  <TYPE.main>Symbol</TYPE.main>
                  <Text style={{ marginTop: '.5rem' }} fontSize={24} fontWeight="500">
                    {symbol}
                  </Text>
                </Column>
                <Column>
                  <TYPE.main>Name</TYPE.main>
                  <Text style={{ marginTop: '.5rem' }} fontSize={24} fontWeight="500">
                    {name}
                  </Text>
                </Column>
                <Column>
                  <TYPE.main>Address</TYPE.main>
                  <AutoRow align="flex-end">
                    <Text style={{ marginTop: '.5rem' }} fontSize={24} fontWeight="500">
                      {address.slice(0, 8) + '...' + address.slice(36, 42)}
                    </Text>
                    <CopyHelper toCopy={address} />
                  </AutoRow>
                </Column>
                <ButtonLight color={backgroundColor}>
                  <Link color={backgroundColor} external href={'https://etherscan.io/address/' + address}>
                    View on Etherscan ↗
                  </Link>
                </ButtonLight>
              </TokenDetailsLayout>
            </Panel>
          </>
        </DashboardWrapper>
      </WarningGrouping>
    </PageWrapper>
  )
}

export default withRouter(TokenPage)
