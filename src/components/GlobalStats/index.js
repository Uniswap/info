import React from 'react'
import styled from 'styled-components'
import { RowBetween } from '../Row'
import { useGlobalData, useEthPrice } from '../../contexts/GlobalData'
import { formattedNum, getNativeTokenSymbol, localNumber } from '../../utils'
import { TYPE } from '../../Theme'

const Header = styled.div`
  width: 100%;
  position: sticky;
  top: 0;
`

const Medium = styled.span`
  font-weight: 500;
`

const StyledGlobalStats = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 2fr 1fr 2fr;
  font-size: 12px;
  font-weight: 500;

  @media screen and (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

export default function GlobalStats() {
  const { oneDayTxns, pairCount, oneDayFeeUSD } = useGlobalData()
  const [ethPrice] = useEthPrice()
  const formattedEthPrice = ethPrice ? formattedNum(ethPrice, true) : '-'
  const oneDayFees = oneDayFeeUSD ? formattedNum(oneDayFeeUSD, true) : ''

  return (
    <Header>
      <RowBetween style={{ padding: '0.5rem' }}>
        <StyledGlobalStats>
          <TYPE.main mr={'1rem'} style={{ position: 'relative' }}>
            {getNativeTokenSymbol()} Price: <Medium>{formattedEthPrice}</Medium>
          </TYPE.main>

          <TYPE.main mr={'1rem'}>
            Transactions (24h): <Medium>{localNumber(oneDayTxns)}</Medium>
          </TYPE.main>

          <TYPE.main mr={'1rem'}>
            Pairs: <Medium>{localNumber(pairCount)}</Medium>
          </TYPE.main>

          <TYPE.main mr={'1rem'}>
            Fees (24h): <Medium>{oneDayFees}</Medium>&nbsp;
          </TYPE.main>
        </StyledGlobalStats>
      </RowBetween>
    </Header>
  )
}
