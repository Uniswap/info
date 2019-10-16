import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import styled from 'styled-components'
import { Flex } from 'rebass'
import { useWeb3Context } from 'web3-react'
import Jazzicon from 'jazzicon'
import Title from '../Title'
import Select from '../Select'
import TokenLogo from '../TokenLogo'
import CurrencySelect from '../CurrencySelect'
import { Header } from '../'

const NavWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
`

const AccountBar = styled.div`
  width: 130px;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 38px;
  margin-left: 0.8em;
  height: 38px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  padding: 0 12px;
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

const Identicon = styled.div`
  height: 1rem;
  width: 1rem;
  border-radius: 1.125rem;
  background-color: grey;
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
  mkrLogo,
  location
}) {
  // for now exclude broken tokens
  const [filteredDirectory, setDirectory] = useState([])

  useEffect(() => {
    for (var i = 0; i < directory.length; i++) {
      if (parseFloat(exchanges[directory[i].value].ethBalance) > 0.5) {
        let newd = filteredDirectory
        const logo = <TokenLogo address={directory[i].tokenAddress} style={{ height: '20px', width: '20px' }} />
        directory[i].logo = logo
        newd.push(directory[i])
        setDirectory(newd)
      }
    }
  }, [exchanges, directory, filteredDirectory])

  const web3 = useWeb3Context()

  const ref = useRef()
  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = ''
      if (web3.account) {
        ref.current.appendChild(Jazzicon(16, parseInt(web3.account.slice(2, 10), 16)))
      }
    }
  }, [web3.account])

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
          defaultValue={{ label: 'USD', value: 'USD' }}
          onChange={select => {
            setCurrencyUnit(select.value)
          }}
        />
        <NavSelect
          options={filteredDirectory}
          mkrLogo={mkrLogo}
          tokenSelect={true}
          onChange={select => {
            if (exchangeAddress !== select.value) {
              switchActiveExchange(select.value)
            }
          }}
        />
        {web3.account ? (
          <AccountBar>
            {web3.account.slice(0, 6) + '...' + web3.account.slice(38, 42)} <Identicon ref={ref} />
          </AccountBar>
        ) : (
          ''
        )}
      </FlexEnd>
    </Header>
  )
}
