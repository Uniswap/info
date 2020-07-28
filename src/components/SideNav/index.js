import React, { useState, useRef, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { TrendingUp, PieChart, Disc, List } from 'react-feather'
import styled from 'styled-components'
import { TYPE } from '../../Theme'
import { AutoColumn } from '../Column'
import Title from '../Title'

export const SubNav = styled.ul`
  list-style: none;
  position: sticky;
  top: 0;
  padding: 24px;
  padding-top: 0rem;
  height: 100%;
  margin-top: 0;
`
export const SubNavEl = styled.li`
  list-style: none;
  display: flex;
  margin-bottom: 2rem;
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
      <AutoColumn>
        <Title />
        <SubNavEl
          onClick={() => handleScroll(OverviewRef)}
          isActive={active === OverviewRef}
          style={{ marginTop: '2rem' }}
        >
          <TrendingUp size={20} style={{ marginRight: '1rem' }} />
          <TYPE.main>Overview</TYPE.main>
        </SubNavEl>
        <SubNavEl onClick={() => handleScroll(PairsRef)} isActive={active === OverviewRef}>
          <PieChart size={20} style={{ marginRight: '1rem' }} />
          <TYPE.main>Top Pairs</TYPE.main>
        </SubNavEl>
        <SubNavEl onClick={() => handleScroll(TokensRef)} isActive={active === OverviewRef}>
          <Disc size={20} style={{ marginRight: '1rem' }} />
          <TYPE.main>Top Tokens</TYPE.main>
        </SubNavEl>
        <SubNavEl onClick={() => handleScroll(TransactionsRef)} isActive={active === OverviewRef}>
          <List size={20} style={{ marginRight: '1rem' }} />
          <TYPE.main>Transactions</TYPE.main>
        </SubNavEl>
      </AutoColumn>
    </SubNav>
  )
}

export default withRouter(SideNav)
