import React, { useState, useEffect } from 'react'
import 'feather-icons'
import styled from 'styled-components'
import { useUserTransactions, useUserPositions } from '../../contexts/User'
import TxnList from '../../components/TxnList'
import Panel from '../../components/Panel'
import { useUserTotalSwappedUSD } from './hooks'
import PositionList from '../../components/PositionList'
import { formattedNum, formattedPercent } from '../../helpers'
import { AutoRow, RowFixed } from '../../components/Row'
import { Text } from 'rebass'
import { AutoColumn } from '../../components/Column'
import { calculateTotalLiquidity } from './utils'
import UserChart from '../../components/UserChart'
import AnimatedNumber from 'animated-number-react'

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
    max-width: 1240px;
  }

  @media screen and (max-width: 1080px) {
    width: calc(100% - 40px);
    padding: 0 20px;
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

function AccountPage({ account }) {
  let transactions = useUserTransactions(account)
  let totalSwappedUSD = useUserTotalSwappedUSD(account)
  const transactionCount = transactions?.swaps?.length + transactions?.burns?.length + transactions?.mints?.length
  const positions = useUserPositions(account)

  const positionValue = calculateTotalLiquidity(positions)
  const [animatedVal, setAnimatedVal] = useState(positionValue)

  useEffect(() => {
    if (positionValue) {
      setAnimatedVal(positionValue)
    }
  }, [positionValue])

  const formatValue = value => formattedNum(value, true)

  return (
    <PageWrapper>
      <ThemedBackground />
      <Header>
        <AutoRow gap="10px">
          <Text fontSize={32} fontWeight={600}>
            Account
          </Text>
          <AccountWrapper>
            <Text fontSize={20} fontWeight={600}>
              {account?.slice(0, 6) + '...' + account?.slice(38, 42)}
            </Text>
          </AccountWrapper>
        </AutoRow>
      </Header>

      <Panel>
        <AutoColumn gap="24px">
          <Text fontSize={20} fontWeight={600}>
            LP Stats
          </Text>
          <AutoRow gap="20px">
            <AutoColumn gap="8px">
              <RowFixed>
                <Text fontSize={28} fontWeight={600} mr={'10px'} width={'100px'}>
                  <AnimatedNumber value={animatedVal} formatValue={formatValue} duration={500} />
                </Text>
                <Text>{formattedPercent(0.2)}</Text>
              </RowFixed>
              <Text fontSize={16}>Liquidity Value</Text>
            </AutoColumn>
            <AutoColumn gap="8px">
              <RowFixed>
                <Text fontSize={28} fontWeight={600} mr={'10px'}>
                  $676.32
                </Text>
                <Text>{formattedPercent(10.2)}</Text>
              </RowFixed>
              <Text fontSize={16}>Net Return (dummy val)</Text>
            </AutoColumn>
            <AutoColumn gap="8px">
              <RowFixed>
                <Text fontSize={28} fontWeight={600} mr={'10px'}>
                  $430.33
                </Text>
                <Text>{formattedPercent(6.11)}</Text>
              </RowFixed>
              <Text fontSize={16}>Return vs Market (dummy val)</Text>
            </AutoColumn>
          </AutoRow>
        </AutoColumn>
      </Panel>
      <Panel style={{ margin: '40px 0' }}>
        <UserChart
          account={account}
          setAnimatedVal={setAnimatedVal}
          animatedVal={animatedVal}
          positionValue={positionValue}
        />
      </Panel>
      <div style={{ marginTop: '40px' }}>
        <AutoRow gap="20px">
          <AutoColumn gap="8px">
            <Text fontSize={24} fontWeight={600}>
              {totalSwappedUSD ? (
                <AnimatedNumber value={parseFloat(totalSwappedUSD)} formatValue={formatValue} duration={500} />
              ) : (
                '-'
              )}
            </Text>
            <Text fontSize={16}>Total Value Swapped</Text>
          </AutoColumn>
          <AutoColumn gap="8px">
            <Text fontSize={24} fontWeight={600}>
              {totalSwappedUSD ? (
                <AnimatedNumber value={parseFloat(totalSwappedUSD * 0.003)} formatValue={formatValue} duration={500} />
              ) : (
                '-'
              )}
            </Text>
            <Text fontSize={16}>Total Fees Paid</Text>
          </AutoColumn>
          <AutoColumn gap="8px">
            <Text fontSize={24} fontWeight={600}>
              {transactionCount ? <AnimatedNumber value={transactionCount} duration={500} /> : '-'}
            </Text>
            <Text fontSize={16}>Total Transactions</Text>
          </AutoColumn>
        </AutoRow>
      </div>
      <AutoColumn gap="16px" style={{ marginTop: '40px' }}>
        <Text fontSize={24} fontWeight={600}>
          Pools
        </Text>
        <Panel>
          <PositionList positions={positions} />
        </Panel>
      </AutoColumn>
      <AutoColumn gap="16px" style={{ marginTop: '40px' }}>
        <Text fontSize={24} fontWeight={600}>
          Transactions
        </Text>
        <Panel>
          <TxnList transactions={transactions} />
        </Panel>
      </AutoColumn>
    </PageWrapper>
  )
}

export default AccountPage
