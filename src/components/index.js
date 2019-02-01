import React from "react";
import styled from "styled-components";
import { Text, Box } from "rebass";

import Link from "./Link";
import Panel from "./Panel";

import { urls } from "../helpers";

const Header = styled(Panel)`
  display: grid;
  grid-template-columns: 1fr minmax(224px, .25fr);
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

export { Hint, Divider, Header, Address };
