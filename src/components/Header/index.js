/**
 * @prettier
 */

import React from "react";
import styled from "styled-components";
import { Box } from "rebass";

const StyledHeader = styled(Box)`
  display: grid;
  grid-template-columns: minmax(max-content, 2fr) minmax(200px, 1fr);
  align-items: center;
`;

const Header = props => (
  <StyledHeader {...props} p="1.5rem">
    {props.children}
  </StyledHeader>
);

export default Header;
