import React from 'react'
import styled from 'styled-components'

import Title from '../Title'
import Search from '../Search'
import { RowFixed, RowBetween } from '../Row'
import { AutoColumn } from '../Column'
import { useMedia } from 'react-use'
import { useV1Data } from '../../contexts/V1Data'
import { useGlobalData } from '../../contexts/GlobalData'
import { formattedNum, toK } from '../../helpers'

const Header = styled.div`
  width: calc(100% - 80px);
  padding: 32px 40px;
  max-width: 1240px;

  @media screen and (max-width: 640px) {
    width: calc(100% - 40px);
    padding: 32px 20px;
  }
`

export default function NavHeader({ token, pair }) {
  const isHome = !token && !pair

  const below600 = useMedia('(max-width: 600px)')

  const { liquidityUsd, txCount, dailyVolumeUSD } = useV1Data()

  const { totalLiquidityUSD, oneDayVolumeUSD, oneDayTxns } = useGlobalData()

  const liquidity =
    totalLiquidityUSD && liquidityUsd ? '$' + toK(parseFloat(totalLiquidityUSD) + parseFloat(liquidityUsd), true) : ''
  const volume = oneDayVolumeUSD && dailyVolumeUSD ? '$' + toK(oneDayVolumeUSD + dailyVolumeUSD, true) : ''
  const txns = oneDayTxns && txCount ? formattedNum(oneDayTxns + txCount) : ''

  return below600 ? (
    <Header>
      <AutoColumn gap="20px">
        <Title token={token} pair={pair} />
        {!isHome && <Search small={true} />}
      </AutoColumn>
    </Header>
  ) : (
    <Header>
      <RowBetween>
        <Title token={token} pair={pair} />
        <RowFixed>
          <div style={{ width: '370px' }}>{!isHome && <Search small={true} />}</div>
          {isHome && (
            <div>
              Combined Liquidity: {liquidity} Combined volume: {volume} Combined Txns: {txns}
            </div>
          )}
        </RowFixed>
      </RowBetween>
    </Header>
  )
}
