import React from 'react'
import 'feather-icons'
import styled from 'styled-components'
import { useUserTransactions, useUserPositions } from '../../contexts/User'
import TxnList from '../../components/TxnList'
import Panel from '../../components/Panel'
import { useUserTotalSwappedUSD } from './hooks'
import PositionList from '../../components/PositionList'
import { formattedNum } from '../../helpers'

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

function AccountPage({ account }) {
  let transactions = useUserTransactions(account)
  let totalSwappedUSD = useUserTotalSwappedUSD(account)
  const transactionCount = transactions?.swaps?.length + transactions?.burns?.length + transactions?.mints?.length
  const positions = useUserPositions(account)

  return (
    <PageWrapper>
      <ThemedBackground />
      <div>account: {account}</div>
      <div>total usd swapped: {formattedNum(parseFloat(totalSwappedUSD), true)}</div>
      <div>txn count: {!!transactionCount ? transactionCount : 0}</div>
      <Panel style={{ marginTop: '100px' }}>
        <PositionList positions={positions} />
      </Panel>
      <Panel style={{ marginTop: '20px' }}>
        <TxnList transactions={transactions} />
      </Panel>
    </PageWrapper>
  )
}

export default AccountPage
