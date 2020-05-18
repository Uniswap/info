import React from 'react'
import styled from 'styled-components'

import Title from '../Title'
import Search from '../Search'
// import CurrencySelect from '../CurrencySelect'
import { RowFixed, RowBetween } from '../Row'
import { AutoColumn } from '../Column'
import { useMedia } from 'react-use'
import { useV1Data } from '../../contexts/V1Data'
import { useGlobalData } from '../../contexts/GlobalData'
import { toK } from '../../helpers'
import { ButtonDark } from '../ButtonStyled'

const Header = styled.div`
  width: calc(100% - 80px);
  padding: 32px 40px;
  max-width: 1240px;

  @media screen and (max-width: 640px) {
    width: calc(100% - 40px);
    padding: 32px 20px;
  }
`

const CombinedWrapper = styled(RowFixed)`
border: 1px solid ${({ theme }) => theme.primary2}
border-radius: 16px;
padding: .25rem 0.25rem .25rem .75rem ;
`

const CombinedData = styled.div`
  color: ${({ theme }) => theme.primary1};
  margin-right: 0.75rem;
  font-size: 1rem;
`

export default function NavHeader({ token, pair }) {
  const isHome = !token && !pair

  const below1024 = useMedia('(max-width: 1024px)')
  const below600 = useMedia('(max-width: 600px)')

  const { liquidityUsd, dailyVolumeUSD } = useV1Data()

  const { totalLiquidityUSD, oneDayVolumeUSD } = useGlobalData()

  const liquidity =
    totalLiquidityUSD && liquidityUsd ? '$' + toK(parseFloat(totalLiquidityUSD) + parseFloat(liquidityUsd), true) : ''
  const volume = oneDayVolumeUSD && dailyVolumeUSD ? '$' + toK(oneDayVolumeUSD + dailyVolumeUSD, true) : ''
  // const txns = oneDayTxns && txCount ? formattedNum(oneDayTxns + txCount) : ''

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
          {isHome && !below600 && (
            <CombinedWrapper>
              {!below1024 && (
                <>
                  <CombinedData>
                    Combined Liquidity: <b>{liquidity}</b>
                  </CombinedData>
                  <CombinedData>
                    Combined Vol: <b>{volume}</b>
                  </CombinedData>
                  {/* <CombinedData>
                    Combined Txns: <b>{txns}</b>
                  </CombinedData> */}
                </>
              )}
              <ButtonDark style={{ minWidth: 'initial' }} href="https://combined.uniswap.info">
                View combined {below1024 && 'data'} ↗
              </ButtonDark>
            </CombinedWrapper>
          )}
        </RowFixed>
      </RowBetween>
    </Header>
  )
}
