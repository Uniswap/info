import React from "react";
import styled from "styled-components";
import { Text, Flex, Box, Button } from 'rebass'
import Emoji from "./Emoji";

import Link from "./Link";
import Panel from "./Panel";

import { urls } from "../helpers";

const Header = styled(Panel)`
  display: grid;
  grid-template-columns: 0.5fr 0.25fr 0.25fr
  align-items: end;
`;

const OverviewPageHeader = styled(Panel)`
  display: grid;
  grid-template-columns: 0.6fr 0.40fr minmax(224px, 0.25fr);
  align-items: center;
`;

const Divider = styled(Box)`
  height: 1px;
  background-color: rgba(43, 43, 43, 0.05);
`;

const Hint = ({ children, ...rest }) => (
  <Text fontSize={12} {...rest}>
    {children}
  </Text>
);

const Address = ({ address, ...rest }) => (
  <Link
    color="button"
    href={urls.showAddress(address)}
    external
    style={{ wordBreak: "break-all" }}
    {...rest}
  >
    {address}
  </Link>
);




const OverviewPageTitle = () => (
  <Flex>
    <Text fontSize="1.5rem" lineHeight="1">
      <Emoji symbol="🦄" label="Unicorn" />
    </Text>
    <Text fontWeight={500} mx="1rem" lineHeight="1.5rem">
      Uniswap Stats
    </Text>
  </Flex>
);

export { Hint, Divider, Header, Address, OverviewPageHeader, OverviewPageTitle };
