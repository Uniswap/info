import React, { useState, useRef, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { TrendingUp, PieChart, Disc, List } from 'react-feather'
import styled from 'styled-components'
import { TYPE } from '../../Theme'
import { AutoColumn } from '../Column'
import Title from '../Title'

import { CustomLink } from '../Link'

export const SubNav = styled.ul`
  list-style: none;
  position: sticky;
  top: 2rem;
  padding: 32px;
  margin-top: 0;
  display: grid;
  grid-auto-rows: 1fr;
  grid-gap: 16px;
`
export const SubNavEl = styled(CustomLink)`
  list-style: none;
  display: flex;
  width: 100%;
  font-weight: ${({ isActive }) => (isActive ? 600 : 500)};
  :hover {
    cursor: pointer;
  }
`

function SideNav() {
  const OverviewRef = useRef()
  const PairsRef = useRef()
  const TokensRef = useRef()
  const TransactionsRef = useRef()

  const [active, setActive] = useState(null)

  useEffect(() => {
    setActive(OverviewRef)
    document.querySelector('body').scrollTo({
      behavior: 'smooth',
      top: 0
    })
  }, [])

  const handleScroll = ref => {
    setActive(ref.current)
    document.querySelector('body').scrollTo({
      behavior: 'smooth',
      top: ref.current.offsetTop - 120
    })
  }

  return (
    <SubNav>
      <AutoColumn gap={'24px'}>
        <Title />
        <SubNavEl to="/" style={{ margintop: '1rem' }}>
          <TrendingUp size={20} style={{ marginRight: '1rem' }} />
          <TYPE.main>Home</TYPE.main>
        </SubNavEl>
        <SubNavEl to="/pairs">
          <PieChart size={20} style={{ marginRight: '1rem' }} />
          <TYPE.main>Pairs</TYPE.main>
        </SubNavEl>
        <SubNavEl to="/tokens">
          <Disc size={20} style={{ marginRight: '1rem' }} />
          <TYPE.main>Tokens</TYPE.main>
        </SubNavEl>
        <SubNavEl to="/transactions">
          <List size={20} style={{ marginRight: '1rem' }} />
          <TYPE.main>Transactions</TYPE.main>
        </SubNavEl>
        <SubNavEl to="/accounts">
          <List size={20} style={{ marginRight: '1rem' }} />
          <TYPE.main>Accounts</TYPE.main>
        </SubNavEl>
      </AutoColumn>
    </SubNav>
  )
}

export default withRouter(SideNav)
