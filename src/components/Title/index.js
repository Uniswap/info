import React from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

import { Flex } from 'rebass'
import Link from '../Link'
import { RowFixed } from '../Row'
import Logo from '../../assets/logo_white.svg'

const TitleWrapper = styled.div`
  text-decoration: none;
  padding-left: 40px;
  &:hover {
    cursor: pointer;
  }

  a {
    display: flex;
  }

  img {
    width: 44px;
    height: 50px;
  }

  z-index: 10;

  @media screen and (max-width: 800px) {
    padding: 0;

    img {
      width: 35px;
      height: 40px;
    }
  }
`

const LogoName = styled.h2`
  font-family: Gilroy-Bold;
  font-size: 17px;
  letter-spacing: 0.15px;
  color: #ffffff;
  margin-left: 15px;
  @media screen and (max-width: 800px) {
    margin-left: 11px;
    font-size: 24px;
  }
`

export default function Title() {
  const history = useHistory()

  return (
    <TitleWrapper onClick={() => history.push('/')}>
      <Flex alignItems="center">
        <RowFixed>
          <Link id="link" onClick={() => history.push('/')}>
            <img src={Logo} alt="logo" />
          </Link>
          <LogoName>TBCC SWAP</LogoName>
        </RowFixed>
      </Flex>
    </TitleWrapper>
  )
}
