import React from 'react'
import styled from 'styled-components'

import Title from '../Title'
import Search from '../Search'
import { RowFixed, RowBetween } from '../Row'
import { AutoColumn } from '../Column'
import { useMedia } from 'react-use'

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: calc(100% - 20px);
  overflow: scroll;
  padding: 20px 0;
  
  & > * {
    width: 100%;
    max-width: 1240px;
  }

  @media screen and (max-width: 1080px) {
    width: calc(100% - 40px);
    padding: 20px 20px;
  }

  background-color: rgba(255, 255, 255, 0.3);
  margin-bottom: 20px;
`

// const CombinedWrapper = styled(RowFixed)`
//   border-radius: 16px;
//   justify-content: flex-end;
// `
//
// const CombinedData = styled.div`
//   color: ${({ theme }) => theme.primary1};
//   margin-right: 0.75rem;
//   font-size: 1rem;
// `

export default function NavHeader({ token, pair, account }) {
  const isHome = !token && !pair && !account

  // const below1024 = useMedia('(max-width: 1024px)')
  const below600 = useMedia('(max-width: 600px)')

  // const { totalLiquidityUSD, oneDayVolumeUSD } = useGlobalData()

  // const liquidity =
  //   totalLiquidityUSD && v1Data?.totalLiquidityUSD
  //     ? '$' + toK(parseFloat(totalLiquidityUSD) + parseFloat(v1Data?.totalLiquidityUSD), true)
  //     : ''
  // const volume =
  //   oneDayVolumeUSD && v1Data?.dailyVolumeUSD ? '$' + toK(oneDayVolumeUSD + v1Data?.dailyVolumeUSD, true) : ''

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
        <Title token={token} pair={pair} account={account} />
        <RowFixed>
          {!isHome && (
            <div style={{ width: '370px' }}>
              {' '}
              <Search small={true} />
            </div>
          )}
          {/*{isHome && (*/}
          {/*  <CombinedWrapper>*/}
          {/*    {!below1024 && (*/}
          {/*      <>*/}
          {/*        <CombinedData>*/}
          {/*          Combined Liquidity: <b>{liquidity}</b>*/}
          {/*        </CombinedData>*/}
          {/*        <CombinedData>*/}
          {/*          Combined Vol: <b>{volume}</b>*/}
          {/*        </CombinedData>*/}
          {/*      </>*/}
          {/*    )}*/}
          {/*    <Link href="" target="_blank">*/}
          {/*      <ButtonDark style={{ minWidth: 'initial', height: '36px' }}>*/}
          {/*        View combined {below1024 && 'data'} ↗*/}
          {/*      </ButtonDark>*/}
          {/*    </Link>*/}
          {/*  </CombinedWrapper>*/}
          {/*)}*/}
        </RowFixed>
      </RowBetween>
    </Header>
  )
}
