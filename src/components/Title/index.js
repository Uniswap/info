import React from "react";
import { Text, Flex } from "rebass";

import Emoji from "../Emoji";

export const Title = () => (
  <Flex alignItems="center">
    <Text fontSize="1.5rem" lineHeight="1.75rem">
      <Emoji symbol="🦄" label="Unicorn" />
    </Text>
    <Text fontSize="1rem" fontWeight={500} mx="1rem" lineHeight="1.5rem">
      Info
    </Text>
  </Flex>
);

export default Title;
