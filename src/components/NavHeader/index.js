import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import styled from 'styled-components'
import { Flex } from 'rebass'
import Title from '../Title'
import Select from '../Select'
import CurrencySelect from '../CurrencySelect'
import { Header } from '../'

const NavWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
`
const NavSelect = styled(Select)`
  min-width: 240px;

  @media screen and (max-width: 64em) {
    color: black;
  }
`

const CurrencySelectFormatted = styled(CurrencySelect)`
  min-width: 100px;
  margin-right: 0.8em;
`

const FlexEnd = styled(Flex)`
  justify-content: flex-end;
  padding-bottom: 0px;
  align-items: center;

  @media screen and (max-width: 64em) {
    margin-top: 1em;
    padding-bottom: 20px;
  }
`

const LinkText = styled(Link)`
  font-weight: 500;
  color: white;
  margin-right: 1em;
  opacity: ${props => (!props.selected ? 1 : 0.4)};
  text-decoration: none;
`

export default function NavHeader({
  directory,
  exchanges,
  exchangeAddress,
  switchActiveExchange,
  setCurrencyUnit,
  currencyUnit
}) {
  // for now exclude broken tokens
  const [filteredDirectory, setDirectory] = useState([])

  useEffect(() => {
    for (var i = 0; i < directory.length; i++) {
      if (parseFloat(exchanges[directory[i].value].ethBalance) > 0.1) {
        let newd = filteredDirectory
        newd.push(directory[i])
        setDirectory(newd)
      }
    }
  }, [exchanges, directory, filteredDirectory])

  return (
    <Header px={24} py={3} bg={['mineshaft', 'transparent']} color={['white', 'black']}>
      <Title />
      <Flex>
        <NavWrapper></NavWrapper>
      </Flex>
      <FlexEnd>
        {/* <LinkText to="/overview" selected={location.pathname !== '/overview'}>
          Overview
        </LinkText>
        <LinkText to="/tokens" selected={location.pathname !== '/tokens'}>
          Tokens
        </LinkText> */}
        <CurrencySelectFormatted
          options={[
            {
              label: 'ETH',
              value: 'ETH'
            },
            { label: 'USD', value: 'USD' }
          ]}
          value={currencyUnit === 'USD' ? { label: 'USD', value: 'USD' } : { label: 'ETH', value: 'ETH' }}
          defaultValue={{ label: 'USD', value: 'USD' }}
          onChange={select => {
            setCurrencyUnit(select.value)
          }}
        />
        <NavSelect
          options={filteredDirectory}
          tokenSelect={true}
          onChange={select => {
            if (exchangeAddress !== select.value) {
              switchActiveExchange(select.value)
            }
          }}
        />
      </FlexEnd>
    </Header>
  )
}
