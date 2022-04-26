import { useState } from 'react'
import styled from 'styled-components/macro'
import { RowFixed, RowBetween } from '../Row'
import { useMedia } from 'react-use'
import { useGlobalDataSelector, useActiveTokenPrice } from 'state/features/global/selectors'
import { formattedNum, localNumber } from '../../utils'

import UniPrice from '../UniPrice'
import { TYPE } from '../../Theme'
import { useTranslation } from 'react-i18next'

const Header = styled.div`
  width: 100%;
  position: sticky;
  top: 0;
`

export default function GlobalStats() {
  const { t } = useTranslation()
  const below1295 = useMedia('(max-width: 1295px)')
  const below1180 = useMedia('(max-width: 1180px)')
  const below1024 = useMedia('(max-width: 1024px)')
  const below400 = useMedia('(max-width: 400px)')
  const below816 = useMedia('(max-width: 816px)')

  const [showPriceCard, setShowPriceCard] = useState(false)

  const { oneDayVolumeUSD, oneDayTxns, pairCount } = useGlobalDataSelector()
  const activeTokenPrice = useActiveTokenPrice()
  const formattedPrice = activeTokenPrice ? formattedNum(activeTokenPrice, true) : '-'
  const oneDayFees = oneDayVolumeUSD ? formattedNum(oneDayVolumeUSD * 0.003, true) : ''

  return (
    <Header>
      {!below400 && (
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
                ETH {t('price')}: {formattedPrice}
                {showPriceCard && <UniPrice />}
              </TYPE.light>
            )}

            {!below1180 && (
              <TYPE.light fontSize={14} fontWeight={700} mr={'1rem'}>
                {t('transactions')} (24H): {localNumber(oneDayTxns)}
              </TYPE.light>
            )}
            {!below1024 && (
              <TYPE.light fontSize={14} fontWeight={700} mr={'1rem'}>
                {t('pairs')}: {localNumber(pairCount)}
              </TYPE.light>
            )}
            {!below1295 && (
              <TYPE.light fontSize={14} fontWeight={700} mr={'1rem'}>
                {t('fees24hrs')}: {oneDayFees}&nbsp;
              </TYPE.light>
            )}
          </RowFixed>
        </RowBetween>
      )}
    </Header>
  )
}
