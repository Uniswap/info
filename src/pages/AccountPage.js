import React, { useState, useMemo, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { useUserTransactions, useUserPositions } from '../contexts/User'
import TxnList from '../components/TxnList'
import Panel from '../components/Panel'
import { formattedNum } from '../utils'
import Row, { AutoRow, RowFixed, RowBetween } from '../components/Row'
import { Text } from 'rebass'
import { AutoColumn } from '../components/Column'
import UserChart from '../components/UserChart'
import PairReturnsChart from '../components/PairReturnsChart'
import PositionList from '../components/PositionList'
import { TYPE } from '../Theme'
import { useMedia } from 'react-use'
import Loader from '../components/Loader'
import { ButtonDropdown } from '../components/ButtonStyled'
import { Hover, PageWrapper, FixedMenu, ContentWrapper } from '../components'
import DoubleTokenLogo from '../components/DoubleLogo'
import { TrendingUp, PieChart, Activity } from 'react-feather'
import { SubNav, SubNavEl } from '../components/index'
import Link from '../components/Link'
import { FEE_WARNING_TOKENS } from '../constants'

const ListOptions = styled(AutoRow)`
  height: 40px;
  width: 100%;
  font-size: 1.25rem;
  font-weight: 600;

  @media screen and (max-width: 640px) {
    font-size: 1rem;
  }
`

const AccountWrapper = styled.div`
  background-color: rgba(255, 255, 255, 0.2);
  padding: 6px 16px;
  border-radius: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.primary1};
`

const Header = styled.div``

const DashboardWrapper = styled.div`
  width: 100%;
`

const DropdownWrapper = styled.div`
  position: relative;
  margin-bottom: 1rem;
  border: 1px solid #edeef2;
  border-radius: 12px;
`

const Flyout = styled.div`
  position: absolute;
  top: 32px;
  left: -1px;
  width: 100%;
  background-color: white;
  z-index: 999;
  border-bottom-right-radius: 10px;
  border-bottom-left-radius: 10px;
  padding-top: 26px;
  border: 1px solid #edeef2;
  border-top: none;
`

const MenuRow = styled(Row)`
  width: 100%;
  padding: 12px 0;
  padding-left: 12px;

  :hover {
    cursor: pointer;
    background-color: #f7f8fa;
  }
`

const PanelWrapper = styled.div`
  grid-template-columns: 1fr;
  grid-template-rows: max-content;
  gap: 6px;
  display: inline-grid;
  width: 100%;
  align-items: start;
`

const Warning = styled.div`
  background-color: ${({ theme }) => theme.bg2}
  padding: 1rem;
  font-weight: 600;
  border-radius: 10px;
  margin-bottom: 1rem;
  width: calc(100% - 2rem);
`

const LIST_VIEW = {
  POSITIONS: 'POSITIONS',
  TRANSACTIONS: 'TRANSACTIONS',
  STATS: 'STATS'
}

function AccountPage({ account }) {
  // get data for this account
  const transactions = useUserTransactions(account)
  const positions = useUserPositions(account)

  const below1080 = useMedia('(max-width: 1080px)')
  const below600 = useMedia('(max-width: 600px)')

  // get data for user stats
  const transactionCount = transactions?.swaps?.length + transactions?.burns?.length + transactions?.mints?.length

  // get derived totals
  let totalSwappedUSD = useMemo(() => {
    return transactions?.swaps
      ? transactions?.swaps.reduce((total, swap) => {
          return total + parseFloat(swap.amountUSD)
        }, 0)
      : 0
  }, [transactions])

  // if any position has token from fee warning list, show warning
  const [showWarning, setShowWarning] = useState(false)
  useEffect(() => {
    if (positions) {
      for (let i = 0; i < positions.length; i++) {
        if (
          FEE_WARNING_TOKENS.includes(positions[i].pair.token0.id) ||
          FEE_WARNING_TOKENS.includes(positions[i].pair.token1.id)
        ) {
          setShowWarning(true)
        }
      }
    }
  }, [positions])

  // settings for list view and dropdowns
  const hideLPContent = positions && positions.length === 0
  const [showDropdown, setShowDropdown] = useState(false)
  const [listView, setListView] = useState(hideLPContent ? LIST_VIEW.TRANSACTIONS : LIST_VIEW.POSITIONS)
  const [activePosition, setActivePosition] = useState()

  const dynamicPositions = activePosition ? [activePosition] : positions

  const aggregateFees = dynamicPositions?.reduce(function(total, position) {
    return total + position.fees.sum
  }, 0)

  const positionValue = useMemo(() => {
    return dynamicPositions
      ? dynamicPositions.reduce((total, position) => {
          return (
            total +
            (parseFloat(position?.liquidityTokenBalance) / parseFloat(position?.pair?.totalSupply)) *
              position?.pair?.reserveUSD
          )
        }, 0)
      : 0
  }, [dynamicPositions])

  const OverviewRef = useRef()
  const StatsRef = useRef()

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
      top: ref.current.offsetTop - 120
    })
  }

  return (
    <PageWrapper>
      <FixedMenu>
        <Header ref={OverviewRef}>
          <RowBetween>
            <Text fontSize={24} fontWeight={600}>
              Account Stats
            </Text>
            <AccountWrapper>
              <Link
                lineHeight={'145.23%'}
                href={'https://etherscan.io/address/' + account}
                target="_blank"
                color="#ff007a"
              >
                <Text fontSize={20} fontWeight={600}>
                  {account?.slice(0, 6) + '...' + account?.slice(38, 42)}
                </Text>
              </Link>
            </AccountWrapper>
          </RowBetween>
        </Header>
      </FixedMenu>
      <ContentWrapper>
        <DashboardWrapper>
          {showWarning && (
            <Warning>Note: Fees from pairs including AMPL may be incorrect due to token mechanics.</Warning>
          )}
          {!hideLPContent && (
            <DropdownWrapper>
              <ButtonDropdown
                width="100%"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
                onClick={() => setShowDropdown(!showDropdown)}
                open={showDropdown}
              >
                {!activePosition && (
                  <RowFixed>
                    <Activity stroke="black" size={16} />
                    <Text fontSize="16px" color="black" fontWeight={400} ml={'10px'}>
                      All Positions
                    </Text>
                  </RowFixed>
                )}
                {activePosition && (
                  <RowFixed>
                    <DoubleTokenLogo a0={activePosition.pair.token0.id} a1={activePosition.pair.token1.id} size={16} />
                    <Text fontWeight={400} color="black" ml={'16px'} fontSize="16px">
                      {activePosition.pair.token0.symbol}-{activePosition.pair.token1.symbol} Position
                    </Text>
                  </RowFixed>
                )}
              </ButtonDropdown>
              {showDropdown && (
                <Flyout>
                  <AutoColumn gap="0px">
                    {positions?.map((p, i) => {
                      return (
                        p.pair.id !== activePosition?.pair.id && (
                          <MenuRow
                            onClick={() => {
                              setActivePosition(p)
                              setShowDropdown(false)
                            }}
                            key={i}
                          >
                            <DoubleTokenLogo a0={p.pair.token0.id} a1={p.pair.token1.id} size={16} />
                            <Text fontWeight={400} color="black" ml={'16px'} fontSize="16px">
                              {p.pair.token0.symbol}-{p.pair.token1.symbol} Position
                            </Text>
                          </MenuRow>
                        )
                      )
                    })}
                    {activePosition && (
                      <MenuRow
                        onClick={() => {
                          setActivePosition()
                          setShowDropdown(false)
                        }}
                      >
                        <RowFixed>
                          <Activity stroke="black" size={16} />
                          <Text fontSize="16px" color="black" fontWeight={400} ml={'10px'}>
                            All Positions
                          </Text>
                        </RowFixed>
                      </MenuRow>
                    )}
                  </AutoColumn>
                </Flyout>
              )}
            </DropdownWrapper>
          )}
          {!hideLPContent && (
            <Panel style={{ height: '100%', marginBottom: '1rem' }}>
              <AutoRow gap="20px">
                <AutoColumn gap="10px">
                  <RowBetween>
                    <TYPE.main fontSize={'16px'} fontWeight={400} color="#888D9B">
                      Liquidity Value (Including Fees)
                    </TYPE.main>
                    <div />
                  </RowBetween>
                  <RowFixed align="flex-end">
                    <TYPE.main fontSize={'24px'} lineHeight={1} fontWeight={600}>
                      {positionValue ? formattedNum(positionValue, true) : '-'}
                    </TYPE.main>
                  </RowFixed>
                </AutoColumn>
                <AutoColumn gap="10px">
                  <RowBetween>
                    <TYPE.main fontSize={'16px'} fontWeight={400} color="#888D9B">
                      Fees Earned (Cumulative)
                    </TYPE.main>
                    <div />
                  </RowBetween>
                  <RowFixed align="flex-end">
                    <TYPE.main
                      fontSize={'24px'}
                      lineHeight={1}
                      fontWeight={600}
                      color={aggregateFees ? 'green' : 'black'}
                    >
                      {aggregateFees ? formattedNum(aggregateFees, true, true) : '-'}
                    </TYPE.main>
                  </RowFixed>
                </AutoColumn>
              </AutoRow>
            </Panel>
          )}
          {!hideLPContent && (
            <PanelWrapper>
              <Panel style={{ gridColumn: '1' }}>
                {activePosition ? (
                  <PairReturnsChart account={account} position={activePosition} />
                ) : (
                  <UserChart account={account} position={activePosition} />
                )}
              </Panel>
            </PanelWrapper>
          )}
          <AutoColumn gap="16px" ref={StatsRef}>
            <ListOptions gap="10px" style={{ marginTop: '2rem' }}>
              {!hideLPContent && (
                <Hover>
                  <TYPE.main
                    onClick={() => {
                      setListView(LIST_VIEW.POSITIONS)
                    }}
                    fontSize={below600 ? '14px' : '1.125rem'}
                    color={listView !== LIST_VIEW.POSITIONS ? '#aeaeae' : 'black'}
                  >
                    Positions
                  </TYPE.main>
                </Hover>
              )}
              <Hover>
                <TYPE.main
                  onClick={() => {
                    setListView(LIST_VIEW.TRANSACTIONS)
                  }}
                  fontSize={below600 ? '14px' : '1.125rem'}
                  color={listView !== LIST_VIEW.TRANSACTIONS ? '#aeaeae' : 'black'}
                >
                  Transactions
                </TYPE.main>
              </Hover>
              <Hover>
                <TYPE.main
                  onClick={() => {
                    setListView(LIST_VIEW.STATS)
                  }}
                  fontSize={below600 ? '14px' : '1.125rem'}
                  color={listView !== LIST_VIEW.STATS ? '#aeaeae' : 'black'}
                >
                  Account Stats
                </TYPE.main>
              </Hover>
            </ListOptions>
          </AutoColumn>
          <Panel
            style={{
              border: '1px solid rgba(43, 43, 43, 0.05)',
              marginTop: '1.5rem',
              marginBottom: '120px'
            }}
          >
            {listView === LIST_VIEW.TRANSACTIONS ? (
              transactions ? (
                <TxnList transactions={transactions} />
              ) : (
                <Loader />
              )
            ) : listView === LIST_VIEW.POSITIONS ? (
              <PositionList positions={positions} />
            ) : (
              <div>
                <AutoRow gap="20px">
                  <AutoColumn gap="8px">
                    <Text fontSize={24} fontWeight={600}>
                      {totalSwappedUSD ? formattedNum(totalSwappedUSD, true) : '-'}
                    </Text>
                    <Text fontSize={16}>Total Value Swapped</Text>
                  </AutoColumn>
                  <AutoColumn gap="8px">
                    <Text fontSize={24} fontWeight={600}>
                      {totalSwappedUSD ? formattedNum(totalSwappedUSD * 0.003, true) : '-'}
                    </Text>
                    <Text fontSize={16}>Total Fees Paid</Text>
                  </AutoColumn>
                  <AutoColumn gap="8px">
                    <Text fontSize={24} fontWeight={600}>
                      {transactionCount ? transactionCount : '-'}
                    </Text>
                    <Text fontSize={16}>Total Transactions</Text>
                  </AutoColumn>
                </AutoRow>
              </div>
            )}
          </Panel>
        </DashboardWrapper>
        {!below1080 && (
          <SubNav style={{ marginTop: 0 }}>
            <SubNavEl onClick={() => handleScroll(OverviewRef)} isActive={active === OverviewRef}>
              <TrendingUp size={20} style={{ marginRight: '1rem' }} />
              <TYPE.main>Overview</TYPE.main>
            </SubNavEl>
            <SubNavEl onClick={() => handleScroll(StatsRef)} isActive={active === OverviewRef}>
              <PieChart size={20} style={{ marginRight: '1rem' }} />
              <TYPE.main>Account Stats</TYPE.main>
            </SubNavEl>
          </SubNav>
        )}
      </ContentWrapper>
    </PageWrapper>
  )
}

export default AccountPage
