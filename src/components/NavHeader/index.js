import React from 'react'
import styled from 'styled-components'

import Title from '../Title'
import Search from '../Search'
// import CurrencySelect from '../CurrencySelect'
import { RowFixed, RowBetween } from '../Row'
import { AutoColumn } from '../Column'
import { useMedia } from 'react-use'

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

  return below600 ? (
    <Header>
      <AutoColumn gap="20px">
        <Title token={token} pair={pair} />
        {/* <CurrencySelect /> */}
        {!isHome && <Search small={true} />}
      </AutoColumn>
    </Header>
  ) : (
    <Header>
      <RowBetween>
        <Title token={token} pair={pair} />
        <RowFixed>
          {/* <CurrencySelect /> */}
          <div style={{ width: '370px' }}>{!isHome && <Search small={true} />}</div>
        </RowFixed>
      </RowBetween>
    </Header>
  )
}
