import React from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

import { Text, Flex } from 'rebass'
import Link from '../Link'
import { RowFixed } from '../Row'
import LogoDark from '../../assets/logo_white.svg'
import WordmarkDark from '../../assets/wordmark_white.svg'

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
            <img src={LogoDark} alt="logo" />
          </UniIcon>
          <img style={{ marginLeft: '4px', marginTop: '0px' }} src={WordmarkDark} alt="logo" />
          <Text marginLeft={10} fontSize={16} marginTop={'2px'}>
            / Flippening
          </Text>
        </RowFixed>
      </Flex>
    </TitleWrapper>
  )
}
