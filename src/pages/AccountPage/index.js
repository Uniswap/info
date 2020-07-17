import React, { useState, useEffect, useMemo } from 'react'
import 'feather-icons'
import styled from 'styled-components'
import { useUserTransactions, useUserPositions } from '../../contexts/User'
import TxnList from '../../components/TxnList'
import Panel from '../../components/Panel'
import { formattedNum, formattedPercent } from '../../helpers'
import { AutoRow, RowFixed, RowBetween } from '../../components/Row'
import { Text } from 'rebass'
import { AutoColumn } from '../../components/Column'
import { calculateTotalLiquidity } from './utils'
import UserChart from '../../components/UserChart'
import PairReturnsChart from '../../components/PairReturnsChart'
import PositionList from '../../components/PositionList'
import { TYPE } from '../../Theme'
import { useMedia } from 'react-use'
import Loader from '../../components/Loader'
import { ButtonDropdown } from '../../components/ButtonStyled'
import { Hover } from '../../components'
import AnimatedNumber from 'animated-number-react'

import DoubleTokenLogo from '../../components/DoubleLogo'

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 100px;
  width: calc(100% - 20px);
  overflow: scroll;
  & > * {
    width: 100%;
    max-width: 1140px;
  }

  @media screen and (max-width: 1080px) {
    width: calc(100% - 40px);
    padding: 0 20px;
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

const ThemedBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200vh;
  max-width: 100vw;
  z-index: -1;

  transform: translateY(-70vh);
  background: ${({ theme }) => theme.background};
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

const Header = styled.div`
  margin: 20px 0;
`

const DashboardWrapper = styled.div`
  width: 100%;
`

const PanelWrapper = styled.div`
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: max-content;
  gap: 10.5px;
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

const DropdownWrapper = styled.div`
  position: relative;
`

const Flyout = styled.div`
  position: absolute;
  top: 36px;
  left: 0;
  width: calc(100% - 40px);
  background-color: white;
  z-index: 999;
  border-bottom-right-radius: 10px;
  border-bottom-left-radius: 10px;
  padding: 20px;
  box-shadow: 0px 15px 10px -15px #111;
`

const LIST_VIEW = {
  POSITIONS: 'POSITIONS',
  TRANSACTIONS: 'TRANSACTIONS',
  STATS: 'STATS'
}

function AccountPage({ account }) {
  const transactions = useUserTransactions(account)
  const positions = useUserPositions(account)

  let totalSwappedUSD = useMemo(() => {
    return transactions?.swaps
      ? transactions?.swaps.reduce((total, swap) => {
          return total + parseFloat(swap.amountUSD)
        }, 0)
      : 0
  }, [transactions])

  // settings for list view
  const [listView, setListView] = useState(LIST_VIEW.POSITIONS)

  const transactionCount = transactions?.swaps?.length + transactions?.burns?.length + transactions?.mints?.length

  const positionValue = calculateTotalLiquidity(positions)
  const [animatedVal, setAnimatedVal] = useState(positionValue)

  useEffect(() => {
    if (positionValue) {
      setAnimatedVal(positionValue)
    }
  }, [positionValue])

  // used for animation formatting
  const formatValue = value => formattedNum(value, true)

  const netReturn = positions?.reduce(function(total, position) {
    return total + position.netReturn
  }, 0)

  const assetReturn = positions?.reduce(function(total, position) {
    return total + position.assetReturn
  }, 0)
  const uniswapReturn = netReturn - assetReturn

  const aggregateNetReturnPercentChange = positions?.reduce(function(total, position) {
    return total + position.netPercentChange
  }, 0)
  const averageNetPercentChange = aggregateNetReturnPercentChange / positions?.length

  const aggregateAssetReturnPercentChange = positions?.reduce(function(total, position) {
    return total + position.assetPercentChange
  }, 0)
  const averageAssetPercentChange = aggregateAssetReturnPercentChange / positions?.length

  const [costBasis, setCostBasis] = useState()

  const [activePosition, setActivePosition] = useState()

  useEffect(() => {
    let cbTotal = 0
    if (transactions?.mints) {
      cbTotal =
        cbTotal +
        transactions.mints.reduce((total, mint) => {
          return total + parseFloat(mint.amountUSD)
        }, 0)
    }
    if (transactions?.burns) {
      cbTotal =
        cbTotal -
        transactions.burns.reduce((total, burn) => {
          return total + parseFloat(burn.amountUSD)
        }, 0)
    }
    setCostBasis(cbTotal)
  }, [transactions])

  const below1080 = useMedia('(max-width: 1080px)')

  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <PageWrapper>
      <ThemedBackground />
      <Header>
        <RowBetween>
          <Text fontSize={24} fontWeight={600}>
            Liquidity Provider Info
          </Text>
          <AccountWrapper>
            <Text fontSize={20} fontWeight={600}>
              {account?.slice(0, 6) + '...' + account?.slice(38, 42)}
            </Text>
          </AccountWrapper>
        </RowBetween>
      </Header>
      <DashboardWrapper>
        <PanelWrapper>
          <DropdownWrapper>
            <ButtonDropdown
              width="100%"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {!activePosition && (
                <Text fontSize="20px" color="black" fontWeight={500}>
                  Overview
                </Text>
              )}
              {activePosition && (
                <RowFixed>
                  <DoubleTokenLogo a0={activePosition.pair.token0.id} a1={activePosition.pair.token1.id} />
                  <Text fontWeight={500} color="black" ml={'16px'}>
                    {activePosition.pair.token0.symbol}-{activePosition.pair.token1.symbol} Pair Data
                  </Text>
                </RowFixed>
              )}
            </ButtonDropdown>

            {showDropdown && (
              <Flyout>
                <AutoColumn gap="10px">
                  {positions?.map(p => {
                    return (
                      p.pair.id !== activePosition?.pair.id && (
                        <Hover>
                          <RowFixed
                            onClick={() => {
                              setActivePosition(p)
                              setShowDropdown(false)
                            }}
                          >
                            <DoubleTokenLogo a0={p.pair.token0.id} a1={p.pair.token1.id} />
                            <Text fontWeight={500} color="black" ml={'16px'}>
                              {p.pair.token0.symbol}-{p.pair.token1.symbol}
                            </Text>
                          </RowFixed>
                        </Hover>
                      )
                    )
                  })}
                  {activePosition && (
                    <RowFixed
                      onClick={() => {
                        setActivePosition()
                        setShowDropdown(false)
                      }}
                    >
                      <Text fontWeight={500} color="black" ml={'16px'}>
                        Account Overview
                      </Text>
                    </RowFixed>
                  )}
                </AutoColumn>
              </Flyout>
            )}
          </DropdownWrapper>
          <Panel style={{ height: '100%' }}>
            <AutoColumn gap="40px">
              <AutoColumn gap="10px">
                <RowBetween>
                  <TYPE.main fontSize={'16px'} fontWeight={400} color="#888D9B">
                    Total Supplied Liquidity
                  </TYPE.main>
                  <div />
                </RowBetween>
                <RowBetween align="flex-end">
                  <TYPE.main fontSize={'24px'} lineHeight={1} fontWeight={600}>
                    <AnimatedNumber value={animatedVal} formatValue={formatValue} duration={200} />
                  </TYPE.main>
                  <TYPE.main></TYPE.main>
                </RowBetween>
              </AutoColumn>
              <AutoColumn gap="10px">
                <RowBetween>
                  <TYPE.main fontSize={'16px'} fontWeight={400} color="#888D9B">
                    Net USD Return
                  </TYPE.main>
                  <div />
                </RowBetween>
                <RowFixed align="flex-end">
                  <TYPE.main fontSize={'24px'} lineHeight={1} fontWeight={600}>
                    {formattedNum(netReturn, true, true)}
                  </TYPE.main>
                  <TYPE.main fontSize="18px" ml="8px">
                    {formattedPercent(averageNetPercentChange)}
                  </TYPE.main>
                </RowFixed>
              </AutoColumn>
              <AutoColumn gap="10px">
                <RowBetween>
                  <TYPE.main fontSize={'16px'} fontWeight={400} color="#888D9B">
                    Uniswap Return
                  </TYPE.main>
                  <div />
                </RowBetween>
                <RowFixed align="flex-end">
                  <TYPE.main fontSize={'24px'} lineHeight={1} fontWeight={600}>
                    {formattedNum(uniswapReturn, true, true)}
                  </TYPE.main>
                  <TYPE.main fontSize="18px" ml="8px">
                    {formattedPercent(averageNetPercentChange - averageAssetPercentChange)}
                  </TYPE.main>
                </RowFixed>
              </AutoColumn>
              <AutoColumn gap="10px">
                <RowBetween>
                  <TYPE.main fontSize={'16px'} fontWeight={400} color="#888D9B">
                    Asset Return
                  </TYPE.main>
                  <div />
                </RowBetween>
                <RowFixed align="flex-end">
                  <TYPE.main fontSize={'24px'} lineHeight={1} fontWeight={600}>
                    {formattedNum(assetReturn, true, true)}
                  </TYPE.main>
                  <TYPE.main fontSize="18px" ml="8px">
                    {formattedPercent(averageAssetPercentChange)}
                  </TYPE.main>
                </RowFixed>
              </AutoColumn>
            </AutoColumn>
          </Panel>
          <Panel style={{ gridColumn: below1080 ? '1' : '2/4', gridRow: below1080 ? '' : '1/6' }}>
            {activePosition ? (
              <PairReturnsChart
                account={account}
                setAnimatedVal={setAnimatedVal}
                animatedVal={animatedVal}
                positionValue={positionValue}
                position={activePosition}
              />
            ) : (
              <UserChart
                account={account}
                setAnimatedVal={setAnimatedVal}
                animatedVal={animatedVal}
                positionValue={positionValue}
                position={activePosition}
              />
            )}
          </Panel>
        </PanelWrapper>
        <AutoColumn gap="16px">
          <ListOptions gap="10px" style={{ marginBottom: '.5rem' }}>
            <Hover>
              <TYPE.main
                onClick={() => {
                  setListView(LIST_VIEW.POSITIONS)
                }}
                fontSize={'1.125rem'}
                color={listView !== LIST_VIEW.POSITIONS ? '#aeaeae' : 'black'}
              >
                Positions
              </TYPE.main>
            </Hover>
            <Hover>
              <TYPE.main
                onClick={() => {
                  setListView(LIST_VIEW.TRANSACTIONS)
                }}
                fontSize={'1.125rem'}
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
                fontSize={'1.125rem'}
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
            marginTop: '1.5rem'
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
    </PageWrapper>
  )
}

export default AccountPage
