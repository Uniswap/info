import React from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

import { Flex } from 'rebass'
import Link from '../Link'
import { RowFixed } from '../Row'
import Logo from '../../assets/logo_full.svg'

const TitleWrapper = styled.div`
  text-decoration: none;
  margin: 1.25rem 1.5rem;

  &:hover {
    cursor: pointer;
  }

  z-index: 10;
`

export default function Title() {
  const history = useHistory()

  return (
    <TitleWrapper onClick={() => history.push('/')}>
      <Flex alignItems="center">
        <RowFixed>
          <img src={Logo} alt="logo" />
        </RowFixed>
      </Flex>
    </TitleWrapper>
  )
}
