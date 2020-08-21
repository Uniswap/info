import React, { useState } from 'react'
import styled from 'styled-components'
import { RowFixed, RowBetween } from '../Row'
import { useMedia } from 'react-use'
import { useGlobalData, useEthPrice } from '../../contexts/GlobalData'
import { formattedNum, localNumber } from '../../utils'

import UniPrice from '../UniPrice'

const Header = styled.div`
  width: 100%;
  /* background-color: ${({ theme }) => theme.text1};
  color: ${({ theme }) => theme.bg1}; */
  position: sticky;
  top: 0;
  /* z-index: 9999; */
`

const HeaderText = styled.div`
  margin-right: 0.75rem;
  font-size: 0.825rem;
  font-weight: 400;
  display: inline-box;
  display: -webkit-inline-box;
`

const Medium = styled.span`
  font-weight: 500;
`

export default function NavHeader() {
  const below1295 = useMedia('(max-width: 1295px)')
  const below1180 = useMedia('(max-width: 1180px)')
  const below1024 = useMedia('(max-width: 1024px)')
  const below400 = useMedia('(max-width: 400px)')
  const below816 = useMedia('(max-width: 816px)')

  const [showPriceCard, setShowPriceCard] = useState(false)

  const { oneDayVolumeUSD, oneDayTxns, pairCount } = useGlobalData()
  const [ethPrice] = useEthPrice()
  const formattedEthPrice = ethPrice ? formattedNum(ethPrice, true) : '-'
  const oneDayFees = oneDayVolumeUSD ? formattedNum(oneDayVolumeUSD * 0.003, true) : ''

  return (
    <Header>
      <RowBetween style={{ padding: below816 ? '0.5rem' : '.5rem' }}>
        <RowFixed>
          {!below400 && (
            <HeaderText
              onMouseEnter={() => {
                setShowPriceCard(true)
              }}
              onMouseLeave={() => {
                setShowPriceCard(false)
              }}
              style={{ position: 'relative' }}
            >
              ETH Price: <Medium>{formattedEthPrice}</Medium>
              {showPriceCard && <UniPrice />}
            </HeaderText>
          )}

          {!below1180 && (
            <HeaderText>
              Transactions (24H): <Medium>{localNumber(oneDayTxns)}</Medium>
            </HeaderText>
          )}
          {!below1024 && (
            <HeaderText>
              Pairs: <Medium>{localNumber(pairCount)}</Medium>
            </HeaderText>
          )}
          {!below1295 && (
            <HeaderText>
              Fees (24H): <Medium>{oneDayFees}</Medium>&nbsp;
            </HeaderText>
          )}
        </RowFixed>
      </RowBetween>
    </Header>
  )
}
