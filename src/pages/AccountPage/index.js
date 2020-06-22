import React from 'react'
import 'feather-icons'
import styled from 'styled-components'
import { useUserTransactions, useUserPositions } from '../../contexts/User'
import TxnList from '../../components/TxnList'
import Panel from '../../components/Panel'
import { useUserTotalSwappedUSD } from './hooks'
import PositionList from '../../components/PositionList'
import { formattedNum } from '../../helpers'
import { AutoRow } from '../../components/Row'
import { Text } from 'rebass'
import { AutoColumn } from '../../components/Column'

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
        <AutoRow gap="40px">
          <AutoColumn gap="8px">
            <Text fontSize={24} fontWeight={600}>
              {formattedNum(parseFloat(totalSwappedUSD), true)}
            </Text>
            <Text fontSize={16}>Total Swapped</Text>
          </AutoColumn>
          <AutoColumn gap="8px">
            <Text fontSize={24} fontWeight={600}>
              {!!transactionCount ? transactionCount : 0}
            </Text>
            <Text fontSize={16}>Total Transactions</Text>
          </AutoColumn>
        </AutoRow>
      </Panel>
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
