import React, { useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'

import styled from 'styled-components'
import Title from '../Title'
import Select from '../Select'
import CurrencySelect from '../CurrencySelect'
import Panel from '../Panel'
import { isMobile } from 'react-device-detect'
import { useMedia } from 'react-use'

const Header = styled(Panel)`
  display: grid;
  width: 100%;
  grid-template-columns: 1fr 1fr;
  justify-content: space-between;
  align-items: center;
  padding: 24px;

  @media (max-width: 40em) {
    padding: 18px;
  }
`

const TokenSelect = styled(Select)`
  width: 240px;

  @media screen and (max-width: 40em) {
    width: 160px;
  }
`

const NavRight = styled.div`
  display: grid;
  justify-items: end;
  align-items: center;
  grid-template-columns: auto 240px;
  grid-column-gap: 16px;

  @media screen and (max-width: 40em) {
    grid-template-columns: auto 160px;
  }
`

const LinkText = styled(Link)`
  font-weight: 500;
  color: white;
  margin-left: 1em;
  opacity: ${props => (props.selected ? 0 : 0.6)};
  text-decoration: none;

  @media screen and (max-width: 40em) {
    display: none;
  }
`

const NavLeft = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

export default function NavHeader({
  directory,
  exchanges,
  exchangeAddress,
  switchActiveExchange,
  setCurrencyUnit,
  currencyUnit,
  setHistoryDaysToQuery
}) {
  // for now exclude broken tokens
  const [filteredDirectory, setDirectory] = useState([])

  // filter out exchange with low liquidity
  useEffect(() => {
    for (var i = 0; i < directory.length; i++) {
      if (parseFloat(exchanges[directory[i].value].ethBalance) > 0.1) {
        let newd = filteredDirectory
        if (isMobile && directory[i].label.length > 5) {
          directory[i].label = directory[i].label.slice(0, 5) + '...'
        }
        newd.push(directory[i])
        setDirectory(newd)
      }
    }
  }, [exchanges, directory, filteredDirectory])

  const belowLarge = useMedia('(max-width: 40em)')
  const history = useHistory()

  return (
    <Header bg={['transparent', 'transparent']}>
      <NavLeft>
        <Title />
        <LinkText to="/" selected={window.location.pathname !== '/token'}>
          Back to Overview
        </LinkText>
      </NavLeft>
      <NavRight>
        <CurrencySelect setCurrencyUnit={setCurrencyUnit} currencyUnit={currencyUnit} />
        <TokenSelect
          options={filteredDirectory}
          tokenSelect={true}
          placeholder={belowLarge ? 'Tokens' : 'Find token or account'}
          onChange={select => {
            if (exchangeAddress !== select.value) {
              switchActiveExchange(select.value)
            }
            history.push('/token')
          }}
        />
      </NavRight>
    </Header>
  )
}
