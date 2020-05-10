import React from 'react'
import styled from 'styled-components'

import Title from '../Title'
import Search from '../Search'
// import CurrencySelect from '../CurrencySelect'
import { RowFixed, RowBetween } from '../Row'

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

  return (
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
