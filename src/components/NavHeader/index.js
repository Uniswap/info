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

const MigrateBanner = styled.div`
  width: 100%;
  padding: 12px 0;
  display: flex;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 1);
  font-weight: 400;
  text-align: center;
  a {
    color: rgba(255, 255, 255, 1);
    text-decoration: underline;
  }
`

const MigrateBannerSmall = styled(MigrateBanner)`
  @media (min-width: 960px) {
    display: none;
  }
`

const MigrateBannerLarge = styled(MigrateBanner)`
  @media (max-width: 960px) {
    display: none;
  }
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
    <>
      <MigrateBannerSmall>
        <b>V2 is here!&nbsp;</b> <Link href="https://migrate.uniswap.exchange/">Migrate your liquidity&nbsp;</Link>or{' '}
        <Link href="https://uniswap.exchange"> &nbsp;use V2 ↗</Link>
      </MigrateBannerSmall>
      <MigrateBannerLarge>
        This site displays analytics for Uniswap V1 only. To see Uniswap V2 analytics&nbsp;
        <Link href="https://uniswap.info">
          <b>click here ↗</b>
        </Link>
      </MigrateBannerLarge>
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
            placeholder={belowLarge ? 'Tokens' : 'Find token'}
            onChange={select => {
              history.push('/token/' + select.tokenAddress)
            }}
          />
        </NavRight>
      </Header>
    </>
  )
}
