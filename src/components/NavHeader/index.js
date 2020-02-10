import React from "react"

import styled from "styled-components"
import Title from "../Title"
import Panel from "../Panel"
import Search from "../Search"
import CurrencySelect from "../CurrencySelect"

const Header = styled(Panel)`
  display: grid;
  width: 100%;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  padding: 32px 0;

  @media screen and (min-width: 64em) {
    max-width: 1240px;
  }
`

const NavLeft = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const NavRight = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  column-gap: 20px;
  align-items: center;
  justify-items: end;
`

export default function NavHeader({ token, pair }) {
  const isHome = !token && !pair

  return (
    <Header>
      <NavLeft>
        <Title token={token} pair={pair} />
      </NavLeft>
      <NavRight>
        <CurrencySelect />
        {!isHome && <Search />}
      </NavRight>
    </Header>
  )
}
