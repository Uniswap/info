import React from 'react'
import styled from 'styled-components'

import Title from '../Title'
import Search from '../Search'
// import CurrencySelect from '../CurrencySelect'
import { RowFixed, RowBetween } from '../Row'

const Header = styled.div`
  width: 100%;
  padding: 32px 0;

  @media screen and (min-width: 64em) {
    max-width: 1240px;
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
