import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { Flex, Link } from 'rebass'
import { useWeb3Context } from 'web3-react'
import Jazzicon from 'jazzicon'
import Title from '../Title'
import Select from '../Select'
import CurrencySelect from '../CurrencySelect'
import { Header } from '../'

const _StyledLink = ({ active, ...rest }) => <Link {...rest} />
const StyledLink = styled(_StyledLink)`
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  color: ${({ active }) => (active ? 'black' : 'grey')};
`

const NavWrapper = styled.div`
  ${StyledLink}:not(:last-child) {
    margin-right: 0.75rem;
  }
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
  min-width: 200px;

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

export default function NavHeader({
  location,
  directory,
  exchanges,
  defaultExchangeAddress,
  exchangeAddress,
  switchActiveExchange,
  setCurrencyUnit
}) {
  const main = location.pathname === '/'

  // for now exclude broken tokens
  let filteredDirectory = []
  for (var i = 0; i < directory.length; i++) {
    if (parseFloat(exchanges[directory[i].value].ethBalance) > 0.5) {
      // console.log(directory[i])
      filteredDirectory.push(directory[i])
    }
  }

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

  function getDirectoryIndex() {
    let def = {}
    directory.forEach(element => {
      if (element.value === defaultExchangeAddress) {
        def = element
      }
    })
    return (
      <NavSelect
        options={filteredDirectory}
        defaultValue={def}
        onChange={select => {
          if (exchangeAddress !== select.value) {
            switchActiveExchange(select.value)
          }
        }}
      />
    )
  }

  return (
    <Header px={24} py={3} bg={['mineshaft', 'transparent']} color={['white', 'black']}>
      <Title />
      <Flex>
        <NavWrapper></NavWrapper>
      </Flex>
      <FlexEnd>
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
        {main && defaultExchangeAddress && getDirectoryIndex()}
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
