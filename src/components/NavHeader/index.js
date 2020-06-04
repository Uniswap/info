import React from 'react'
import styled from 'styled-components'

import Title from '../Title'
import Search from '../Search'
import { RowFixed, RowBetween } from '../Row'
import { AutoColumn } from '../Column'
import { useMedia } from 'react-use'
import { useGlobalData, useV1Data } from '../../contexts/GlobalData'
import { toK } from '../../helpers'
import { ButtonDark } from '../ButtonStyled'
import Link from '../Link'

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
/* border: 1px solid ${({ theme }) => theme.primary2} */
border-radius: 16px;
padding: .25rem 0.25rem .25rem .75rem ;
justify-content: flex-end;
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

  const { totalLiquidityUSD, oneDayVolumeUSD } = useGlobalData()
  const v1Data = useV1Data()

  const liquidity =
    totalLiquidityUSD && v1Data?.totalLiquidityUSD
      ? '$' + toK(parseFloat(totalLiquidityUSD) + parseFloat(v1Data?.totalLiquidityUSD), true)
      : ''
  const volume =
    oneDayVolumeUSD && v1Data?.dailyVolumeUSD ? '$' + toK(oneDayVolumeUSD + v1Data?.dailyVolumeUSD, true) : ''

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
          {!isHome && (
            <div style={{ width: '370px' }}>
              {' '}
              <Search small={true} />
            </div>
          )}
          {isHome && (
            <CombinedWrapper>
              {!below1024 && (
                <>
                  <CombinedData>
                    Combined Liquidity: <b>{liquidity}</b>
                  </CombinedData>
                  <CombinedData>
                    Combined Vol: <b>{volume}</b>
                  </CombinedData>
                </>
              )}
              <Link href="https://migrate.uniswap.info" target="_blank">
                <ButtonDark style={{ minWidth: 'initial' }}>View combined {below1024 && 'data'} ↗</ButtonDark>
              </Link>
            </CombinedWrapper>
          )}
        </RowFixed>
      </RowBetween>
    </Header>
  )
}
