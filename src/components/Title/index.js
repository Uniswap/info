import React from 'react'
import { Text, Flex } from 'rebass'

import Emoji from '../Emoji'

export default function Title() {
  return (
    <Flex alignItems="center">
      <Text fontSize="1.5rem" lineHeight="1">
        <Emoji symbol="🦄" label="Unicorn" />
      </Text>
      <Text fontWeight={500} mx="1rem" color="white" lineHeight="1.5rem">
        Info
      </Text>
    </Flex>
  )
}
