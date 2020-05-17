import React from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

import { Text, Flex } from 'rebass'
import Link from '../Link'
import { RowFixed } from '../Row'
import Logo from '../../assets/logo.svg'
import Wordmark from '../../assets/wordmark.svg'
// import LogoDark from '../../assets/logo_white.svg'
// import WordmarkDark from '../../assets/wordmark_white.svg'

import { useMedia } from 'react-use'

const TitleWrapper = styled.div`
  text-decoration: none;

  &:hover {
    cursor: pointer;
  }
`

const UniIcon = styled(Link)`
  transition: transform 0.3s ease;
  :hover {
    transform: rotate(-5deg);
  }
`

export default function Title({ token, pair }) {
  const history = useHistory()

  return (
    <TitleWrapper onClick={() => history.push('/')}>
      <Flex alignItems="center">
        <RowFixed>
          <UniIcon id="link" onClick={() => history.push('/')}>
            <img src={Logo} alt="logo" />
          </UniIcon>
          <img style={{ marginLeft: '4px', marginTop: '0px' }} src={Wordmark} alt="logo" />
        </RowFixed>
      </Flex>
    </TitleWrapper>
  )
}
