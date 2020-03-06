import React from 'react'
import { Text, Flex } from 'rebass'
import { useHistory } from 'react-router-dom'
import Emoji from '../Emoji'
import styled from 'styled-components'
import intl from 'react-intl-universal'

const TitleWrapper = styled.div`
  text-decoration: none;

  &:hover {
    cursor: pointer;
  }
`

export default function Title() {
  const history = useHistory()

  return (
    <TitleWrapper onClick={() => history.push('/')}>
      <Flex alignItems="center">
        <Text fontSize="1.5rem" lineHeight="1">
          <Emoji symbol="🦄" label="Unicorn" />
        </Text>

        <Text fontWeight={500} mx="0.5rem" color="white" lineHeight="1.5rem" style={{ textDecorationColor: 'blue' }}>
          {intl.get('Info')}
        </Text>
      </Flex>
    </TitleWrapper>
  )
}
