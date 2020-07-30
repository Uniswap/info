import React, { useState, useRef } from 'react'
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

import { formattedNum, formattedPercent, getPoolLink, getSwapLink } from '../utils'

import { useTokenData, useTokenTransactions, useTokenPairs } from '../contexts/TokenData'
import { TYPE } from '../Theme'
import { useColor } from '../hooks'
import CopyHelper from '../components/Copy'
import { useMedia } from 'react-use'
import { useDataForList } from '../contexts/PairData'
import { useEffect } from 'react'
import Warning from '../components/Warning'
import { SURPRESS_WARNINGS } from '../constants'
import { usePathDismissed, useSavedTokens } from '../contexts/LocalStorage'
import { Hover, SubNav, SubNavEl, PageWrapper, FixedMenu, ContentWrapper } from '../components'
import { PlusCircle, TrendingUp, List, PieChart, Trello } from 'react-feather'

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

  const allPairs = useTokenPairs(address)

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

  const below1180 = useMedia('(max-width: 1180px)')
  const below1080 = useMedia('(max-width: 1080px)')
  const below800 = useMedia('(max-width: 800px)')
  const below600 = useMedia('(max-width: 600px)')

  const [dismissed, markAsDismissed] = usePathDismissed(history.location.pathname)

  const [manualLiquidity, setManualLiquidity] = useState(0)
  useEffect(() => {
    let calculated = 0
    for (let pairAddress in fetchedPairsList) {
      const pair = fetchedPairsList[pairAddress]
      calculated = calculated + parseFloat(pair.reserveUSD ?? 0)
    }
    setManualLiquidity(calculated / 2)
  }, [fetchedPairsList])

  const useManualLiquidity = parseFloat(totalLiquidityUSD / manualLiquidity) < 0.5

  const [savedTokens, addToken] = useSavedTokens()

  const [active, setActive] = useState(null)

  const OverviewRef = useRef()
  const PairsRef = useRef()
  const TransactionsRef = useRef()
  const DataRef = useRef()

  useEffect(() => {
    setActive(OverviewRef)
    window.scrollTo({
      behavior: 'smooth',
      top: 0
    })
  }, [])

  const handleScroll = ref => {
    setActive(ref.current)
    window.scrollTo({
      behavior: 'smooth',
      top: ref.current.offsetTop - 130
    })
  }

  return (
    <PageWrapper>
      <FixedMenu>
        <RowBetween style={{ flexWrap: 'wrap' }} ref={OverviewRef}>
          <RowFixed style={{ flexWrap: 'wrap' }}>
            <RowFixed style={{ alignItems: 'baseline' }}>
              <TokenLogo address={address} size="32px" style={{ alignSelf: 'center' }} />
              <Text fontSize={'1.5rem'} fontWeight={600} style={{ margin: '0 1rem' }}>
                {name ? name + ' ' : ''} {symbol ? '(' + symbol + ')' : ''}
              </Text>{' '}
              {!below1080 && (
                <>
                  <Text fontSize={'1.5rem'} fontWeight={500} style={{ marginRight: '1rem' }}>
                    {price}
                  </Text>
                  {priceChange}
                </>
              )}
            </RowFixed>
          </RowFixed>
          <span>
            <RowFixed ml={below600 ? '0' : '2.5rem'}>
              {!!!savedTokens[address] && !below800 && (
                <Hover onClick={() => addToken(address, symbol)}>
                  <PlusCircle style={{ marginRight: '0.5rem' }} />
                </Hover>
              )}
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
      </FixedMenu>
      <ContentWrapper>
        {!below1180 && (
          <SubNav>
            <SubNavEl onClick={() => handleScroll(OverviewRef)} isActive={active === OverviewRef}>
              <TrendingUp size={20} style={{ marginRight: '1rem' }} />
              <TYPE.main>Overview</TYPE.main>
            </SubNavEl>
            <SubNavEl onClick={() => handleScroll(PairsRef)} isActive={active === PairsRef}>
              <PieChart size={20} style={{ marginRight: '1rem' }} />
              <TYPE.main>Pairs</TYPE.main>
            </SubNavEl>
            <SubNavEl onClick={() => handleScroll(TransactionsRef)} isActive={active === TransactionsRef}>
              <List size={20} style={{ marginRight: '1rem' }} />
              <TYPE.main>Transactions</TYPE.main>
            </SubNavEl>
            <SubNavEl onClick={() => handleScroll(DataRef)} isActive={active === DataRef}>
              <Trello size={20} style={{ marginRight: '1rem' }} />
              <TYPE.main>Token Info</TYPE.main>
            </SubNavEl>
          </SubNav>
        )}
        <Warning
          type={'token'}
          show={!dismissed && !SURPRESS_WARNINGS.includes(address)}
          setShow={markAsDismissed}
          address={address}
        />
        <WarningGrouping disabled={!dismissed && !SURPRESS_WARNINGS.includes(address)}>
          <DashboardWrapper>
            <>
              {!below1080 && <TYPE.main fontSize={'1.125rem'}>Token Stats</TYPE.main>}

              <PanelWrapper style={{ marginTop: '1.5rem' }}>
                {below1080 && price && (
                  <Panel>
                    <AutoColumn gap="20px">
                      <RowBetween>
                        <TYPE.main>Price</TYPE.main>
                        <div />
                      </RowBetween>
                      <RowBetween align="flex-end">
                        {' '}
                        <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
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
                      <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                        {useManualLiquidity ? formattedNum(manualLiquidity, true) : liquidity}
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
                      <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
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
                      <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
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
            <span ref={PairsRef}>
              <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '3rem' }}>
                Top Pairs
              </TYPE.main>
            </span>
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
            <RowBetween mt={40} mb={'1rem'} ref={TransactionsRef}>
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
              <RowBetween style={{ marginTop: '3rem' }} ref={DataRef}>
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
      </ContentWrapper>
    </PageWrapper>
  )
}

export default withRouter(TokenPage)
