import React from 'react'
import { Text, Flex } from 'rebass'
import { Link } from 'react-router-dom'
import Emoji from '../Emoji'

export default function Title() {
  return (
    <Link to="/" style={{ textDecoration: 'none' }}>
      <Flex alignItems="center">
        <Text fontSize="1.5rem" lineHeight="1">
          <Emoji symbol="🦄" label="Unicorn" />
        </Text>
        <Text fontWeight={500} mx="0.5rem" color="white" lineHeight="1.5rem">
          Info
        </Text>
      </Flex>
    </Link>
  )
}
