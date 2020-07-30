import React, { useEffect, useState, useRef } from 'react'
import { withRouter } from 'react-router-dom'
import 'feather-icons'
import styled from 'styled-components'

import { Text } from 'rebass'
import Panel from '../components/Panel'

import { PageWrapper, FixedMenu, ContentWrapperLarge } from '../components/index'
import { AutoRow, RowBetween, RowFixed } from '../components/Row'
import Column, { AutoColumn } from '../components/Column'
import { ButtonLight, ButtonDark } from '../components/ButtonStyled'
import PairChart from '../components/PairChart'
import Link from '../components/Link'
import TxnList from '../components/TxnList'
import Loader from '../components/Loader'

import { formattedNum, formattedPercent, getPoolLink, getSwapLink } from '../utils'
import { useColor } from '../hooks'
import { usePairData, usePairTransactions } from '../contexts/PairData'
import { TYPE, ThemedBackground } from '../Theme'
import { transparentize } from 'polished'
import CopyHelper from '../components/Copy'
import { useMedia } from 'react-use'
import DoubleTokenLogo from '../components/DoubleLogo'
import TokenLogo from '../components/TokenLogo'
import { Hover } from '../components'
import { useEthPrice } from '../contexts/GlobalData'
import Warning from '../components/Warning'
import { SURPRESS_WARNINGS } from '../constants'
import { usePathDismissed, useSavedPairs } from '../contexts/LocalStorage'

import { TrendingUp, PieChart, List, PlusCircle } from 'react-feather'

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
  grid-template-columns: auto auto auto auto 1fr;
  column-gap: 60px;
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

const FixedPanel = styled(Panel)`
  width: fit-content;
  padding: 8px 12px;

  :hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.bg2};
  }
`

const HoverSpan = styled.span`
  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

const WarningGrouping = styled.div`
  opacity: ${({ disabled }) => disabled && '0.4'};
  pointer-events: ${({ disabled }) => disabled && 'none'};
`

const SubNav = styled.ul`
  list-style: none;
  position: sticky;
  top: 11.25rem;
  padding: 0px;
  margin-top: 3rem;
`
const SubNavEl = styled.li`
  list-style: none;
  display: flex;
  margin-bottom: 1rem;
  width: 100%;
  font-weight: ${({ isActive }) => (isActive ? 600 : 500)};

  :hover {
    cursor: pointer;
  }
`

function PairPage({ pairAddress, history }) {
  const {
    token0,
    token1,
    reserve0,
    reserve1,
    reserveUSD,
    trackedReserveUSD,
    oneDayVolumeUSD,
    volumeChangeUSD,
    liquidityChangeUSD,
    oneDayTxns,
    txnChange
  } = usePairData(pairAddress)

  useEffect(() => {
    document.querySelector('body').scrollTo(0, 0)
  }, [])

  const transactions = usePairTransactions(pairAddress)
  const backgroundColor = useColor(pairAddress)

  // liquidity
  const liquidity = trackedReserveUSD
    ? formattedNum(trackedReserveUSD, true)
    : reserveUSD
    ? formattedNum(reserveUSD, true)
    : '-'
  const liquidityChange = formattedPercent(liquidityChangeUSD)

  // mark if using untracked liquidity
  const [usingTracked, setUsingTracked] = useState(true)
  useEffect(() => {
    if (!trackedReserveUSD) {
      setUsingTracked(false)
    }
  }, [trackedReserveUSD])

  // volume
  const volume = oneDayVolumeUSD ? formattedNum(oneDayVolumeUSD, true) : oneDayVolumeUSD === 0 ? '$0' : '-'
  const volumeChange = formattedPercent(volumeChangeUSD)

  // token data for usd
  const [ethPrice] = useEthPrice()
  const token0USD =
    token0?.derivedETH && ethPrice ? formattedNum(parseFloat(token0.derivedETH) * parseFloat(ethPrice), true) : ''

  const token1USD =
    token1?.derivedETH && ethPrice ? formattedNum(parseFloat(token1.derivedETH) * parseFloat(ethPrice), true) : ''

  // rates
  const token0Rate = reserve0 && reserve1 ? formattedNum(reserve1 / reserve0) : '-'
  const token1Rate = reserve0 && reserve1 ? formattedNum(reserve0 / reserve1) : '-'

  // txn percentage change
  const txnChangeFormatted = formattedPercent(txnChange)

  const below1282 = useMedia('(max-width: 1282px)')
  const below1080 = useMedia('(max-width: 1080px)')
  const below900 = useMedia('(max-width: 900px)')

  const [dismissed, markAsDismissed] = usePathDismissed(history.location.pathname)

  const OverviewRef = useRef()
  const DataRef = useRef()
  const TransactionsRef = useRef()

  const [active, setActive] = useState(null)

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
      top: ref.current.offsetTop - - 180
    })
  }

  const [savedPairs, addPair] = useSavedPairs()

  return (
    <PageWrapper>
      <ThemedBackground backgroundColor={transparentize(0.6, backgroundColor)} />

      <span ref={OverviewRef} />
      <FixedMenu>
        <AutoColumn gap="40px">
          <RowBetween style={{ flexWrap: 'wrap' }}>
            <RowFixed style={{ flexWrap: 'wrap', minWidth: '100px' }}>
              <RowFixed>
                {token0 && token1 && (
                  <DoubleTokenLogo a0={token0?.id || ''} a1={token1?.id || ''} size={24} margin={true} />
                )}{' '}
                <Text fontSize={'20px'} fontWeight={500} style={{ margin: '0 1rem' }}>
                  {token0 && token1 ? (
                    <>
                      <HoverSpan onClick={() => history.push(`/token/${token0?.id}`)}>{token0.symbol}</HoverSpan>
                      <span>-</span>
                      <HoverSpan onClick={() => history.push(`/token/${token1?.id}`)}>{token1.symbol}</HoverSpan> Pair
                    </>
                  ) : (
                    ''
                  )}
                </Text>
              </RowFixed>
              <AutoRow gap="6px" style={{ width: 'fit-content', marginTop: below900 ? '1rem' : '0' }}>
                <FixedPanel onClick={() => history.push(`/token/${token0?.id}`)}>
                  <RowFixed>
                    <TokenLogo address={token0?.id} size={'16px'} />
                    <TYPE.main fontSize={'16px'} lineHeight={1} fontWeight={500} ml={'4px'}>
                      {token0 && token1
                        ? `1 ${token0?.symbol} = ${token0Rate} ${token1?.symbol} ${
                            parseFloat(token0?.derivedETH) ? '(' + token0USD + ')' : ''
                          }`
                        : '-'}
                    </TYPE.main>
                  </RowFixed>
                </FixedPanel>
                <FixedPanel onClick={() => history.push(`/token/${token1?.id}`)}>
                  <RowFixed>
                    <TokenLogo address={token1?.id} size={'16px'} />
                    <TYPE.main fontSize={'16px'} lineHeight={1} fontWeight={500} ml={'4px'}>
                      {token0 && token1
                        ? `1 ${token1?.symbol} = ${token1Rate} ${token0?.symbol}  ${
                            parseFloat(token1?.derivedETH) ? '(' + token1USD + ')' : ''
                          }`
                        : '-'}
                    </TYPE.main>
                  </RowFixed>
                </FixedPanel>
              </AutoRow>
            </RowFixed>
            <RowFixed
              ml={below900 ? '0' : '2.5rem'}
              mt={below1080 && '1rem'}
              style={{ flexDirection: below1080 ? 'row-reverse' : 'initial' }}
            >
              {!!!savedPairs[pairAddress] && !below1080 && (
                <Hover onClick={() => addPair(pairAddress, token0.id, token1.id, token0.symbol, token1.symbol)}>
                  <PlusCircle style={{ marginRight: '0.5rem' }} />
                </Hover>
              )}
              <Link external href={getPoolLink(token0?.id, token1?.id)}>
                <ButtonLight color={backgroundColor}>+ Add Liquidity</ButtonLight>
              </Link>
              <Link external href={getSwapLink(token0?.id, token1?.id)}>
                <ButtonDark ml={!below1080 && '.5rem'} mr={below1080 && '.5rem'} color={backgroundColor}>
                  Trade
                </ButtonDark>
              </Link>
            </RowFixed>
          </RowBetween>
        </AutoColumn>
      </FixedMenu>
      <Warning
        type={'pair'}
        show={!dismissed && !(SURPRESS_WARNINGS.includes(token0?.id) && SURPRESS_WARNINGS.includes(token1?.id))}
        setShow={markAsDismissed}
        address={pairAddress}
      />
      <ContentWrapperLarge>
        <WarningGrouping
          disabled={!dismissed && !(SURPRESS_WARNINGS.includes(token0?.id) && SURPRESS_WARNINGS.includes(token1?.id))}
        >
          <DashboardWrapper>
            <>
              {!below1080 && <TYPE.main fontSize={'1.125rem'}>Pair Stats</TYPE.main>}
              <PanelWrapper style={{ marginTop: '1.5rem' }}>
                <Panel style={{ height: '100%' }}>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.main>Total Liquidity {!usingTracked ? '(Untracked)' : ''}</TYPE.main>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                        {liquidity}
                      </TYPE.main>
                      <TYPE.main>{liquidityChange}</TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </Panel>
                <Panel style={{ height: '100%' }}>
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
                <Panel style={{ height: '100%' }}>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.main>Fees (24hrs)</TYPE.main>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                        {oneDayVolumeUSD
                          ? formattedNum(oneDayVolumeUSD * 0.003, true)
                          : oneDayVolumeUSD === 0
                          ? '$0'
                          : '-'}
                      </TYPE.main>
                      <TYPE.main>{volumeChange}</TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </Panel>
                <Panel style={{ height: '100%' }}>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.main>Transactions (24hrs)</TYPE.main>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                        {oneDayTxns ?? '-'}
                      </TYPE.main>
                      <TYPE.main>{txnChangeFormatted}</TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </Panel>
                <Panel style={{ height: '100%' }}>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.main>Pooled Tokens</TYPE.main>
                      <div />
                    </RowBetween>
                    <Hover onClick={() => history.push(`/token/${token0?.id}`)} fade={true}>
                      <AutoRow gap="4px">
                        <TokenLogo address={token0?.id} />
                        <TYPE.main fontSize={20} lineHeight={1} fontWeight={500}>
                          {reserve0 ? formattedNum(reserve0) : ''} {token0?.symbol ?? ''}
                        </TYPE.main>
                      </AutoRow>
                    </Hover>
                    <Hover onClick={() => history.push(`/token/${token1?.id}`)} fade={true}>
                      <AutoRow gap="4px">
                        <TokenLogo address={token1?.id} />
                        <TYPE.main fontSize={20} lineHeight={1} fontWeight={500}>
                          {reserve1 ? formattedNum(reserve1) : ''} {token1?.symbol ?? ''}
                        </TYPE.main>
                      </AutoRow>
                    </Hover>
                  </AutoColumn>
                </Panel>
                <Panel style={{ gridColumn: below1080 ? '1' : '2/4', gridRow: below1080 ? '' : '1/6' }}>
                  <PairChart address={pairAddress} color={backgroundColor} />
                </Panel>
              </PanelWrapper>
              <span ref={TransactionsRef} />
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
              <RowBetween style={{ marginTop: '3rem' }} ref={DataRef}>
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
                    <Text style={{ marginTop: '.5rem' }} fontSize={16} fontWeight="500">
                      {token0 && token1 ? token0.symbol + '-' + token1.symbol : ''}
                    </Text>
                  </Column>
                  <Column>
                    <TYPE.main>Pair Address</TYPE.main>
                    <AutoRow align="flex-end">
                      <Text style={{ marginTop: '.5rem' }} fontSize={16} fontWeight="500">
                        {pairAddress.slice(0, 6) + '...' + pairAddress.slice(38, 42)}
                      </Text>
                      <CopyHelper toCopy={pairAddress} />
                    </AutoRow>
                  </Column>
                  <Column>
                    <TYPE.main>{token0 && token0.symbol + ' Address'}</TYPE.main>
                    <AutoRow align="flex-end">
                      <Text style={{ marginTop: '.5rem' }} fontSize={16} fontWeight="500">
                        {token0 && token0.id.slice(0, 6) + '...' + token0.id.slice(38, 42)}
                      </Text>
                      <CopyHelper toCopy={token0?.id} />
                    </AutoRow>
                  </Column>
                  <Column>
                    <TYPE.main>{token1 && token1.symbol + ' Address'}</TYPE.main>
                    <AutoRow align="flex-end">
                      <Text style={{ marginTop: '.5rem' }} fontSize={16} fontWeight="500">
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
        </WarningGrouping>
        {!below1282 && (
          <SubNav>
            <SubNavEl onClick={() => handleScroll(OverviewRef)} isActive={active === OverviewRef}>
              <TrendingUp size={20} style={{ marginRight: '1rem' }} />
              <TYPE.main>Overview</TYPE.main>
            </SubNavEl>
            <SubNavEl onClick={() => handleScroll(TransactionsRef)} isActive={active === TransactionsRef}>
              <List size={20} style={{ marginRight: '1rem' }} />
              <TYPE.main>Transactions</TYPE.main>
            </SubNavEl>
            <SubNavEl onClick={() => handleScroll(DataRef)} isActive={active === DataRef}>
              <PieChart size={20} style={{ marginRight: '1rem' }} />
              <TYPE.main>Pair Data</TYPE.main>
            </SubNavEl>
          </SubNav>
        )}
      </ContentWrapperLarge>
    </PageWrapper>
  )
}

export default withRouter(PairPage)
