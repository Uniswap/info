import React, { useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'

import styled from 'styled-components'
import Title from '../Title'
import Select from '../Select'
import CurrencySelect from '../CurrencySelect'
import Panel from '../Panel'
import { isMobile } from 'react-device-detect'
import { useMedia } from 'react-use'
import intl from 'react-intl-universal'

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
  width: 180px;

  @media screen and (max-width: 40em) {
    width: 160px;
  }
`

const NavRight = styled.div`
  display: grid;
  justify-items: end;
  align-items: center;
  grid-template-columns: auto 180px;
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

export default function NavHeader({ exchanges, setCurrencyUnit, currencyUnit }) {
  // for now exclude broken tokens
  const [filteredDirectory, setDirectory] = useState([])

  const [capEth, setCapEth] = useState(true)

  // filter out exchange with low liquidity
  useEffect(() => {
    setDirectory([])
    if (exchanges) {
      let fd = []
      Object.keys(exchanges).map(key => {
        let item = exchanges[key]
        if (parseFloat(item.ethBalance) > (capEth ? 0.5 : 0)) {
          if (isMobile && item.label.label.length > 5) {
            item.label.label = item.label.label.slice(0, 5) + '...'
          }
          item.label.logo = item.logo
          item.label.ethBalance = item.ethBalance
          fd.push(item.label)
        }
        return true
      })
      setDirectory(fd)
    }
  }, [exchanges, capEth])

  const belowLarge = useMedia('(max-width: 40em)')
  const history = useHistory()

  return (
    <Header bg={['transparent', 'transparent']}>
      <NavLeft>
        <Title />
        <LinkText to="/" selected={window.location.pathname === '/home'}>
          Back to Home
        </LinkText>
      </NavLeft>
      <NavRight>
        <CurrencySelect setCurrencyUnit={setCurrencyUnit} currencyUnit={currencyUnit} />
        <TokenSelect
          options={filteredDirectory}
          setCapEth={setCapEth}
          capEth={capEth}
          tokenSelect={true}
          placeholder={belowLarge ? intl.get('Tokens') : intl.get('Find_token')}
          onChange={select => {
            history.push('/token/' + select.tokenAddress)
          }}
        />
      </NavRight>
    </Header>
  )
}
