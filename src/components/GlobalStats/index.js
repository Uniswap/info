import React, { useState } from 'react'
import styled from 'styled-components'
import { RowFixed, RowBetween } from '../Row'
import { useMedia } from 'react-use'
import { useGlobalData, useEthPrice } from '../../contexts/GlobalData'
import { formattedNum, localNumber } from '../../utils'

import UniPrice from '../UniPrice'
import { TYPE } from '../../Theme'

const Header = styled.div`
  width: 100%;
  position: sticky;
  top: 0;
`

export default function GlobalStats() {
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
            <TYPE.light
              fontSize={14}
              fontWeight={700}
              mr={'1rem'}
              onMouseEnter={() => {
                setShowPriceCard(true)
              }}
              onMouseLeave={() => {
                setShowPriceCard(false)
              }}
              style={{ position: 'relative' }}
            >
              ETH Price: {formattedEthPrice}
              {showPriceCard && <UniPrice />}
            </TYPE.light>
          )}

          {!below1180 && (
            <TYPE.light 
              fontSize={14}
              fontWeight={700}
              mr={'1rem'}
            >
              Transactions (24H): {localNumber(oneDayTxns)}
            </TYPE.light>
          )}
          {!below1024 && (
            <TYPE.light 
              fontSize={14}
              fontWeight={700}
              mr={'1rem'}
            >
              Pairs: {localNumber(pairCount)}
            </TYPE.light>
          )}
          {!below1295 && (
            <TYPE.light 
              fontSize={14}
              fontWeight={700}
              mr={'1rem'}
            >
              Fees (24H): {oneDayFees}&nbsp;
            </TYPE.light>
          )}
        </RowFixed>
      </RowBetween>
    </Header>
  )
}
