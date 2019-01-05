import React from "react";
import { Flex, Link as RebassLink } from "rebass";

const Link = props => (
  <RebassLink
    {...props}
    style={{
      textDecoration: "none",
      fontWeight: 500
    }}
    fontSize={12}
    mr={"8px"}
  >
    {props.children}
  </RebassLink>
);

const Footer = () => (
  <Flex bg="white" as="footer" p={24}>
    <Link href="https://github.com/Uniswap/uniswap-info">GitHub</Link>
    <Link>Slack</Link>
    <Link href="https://uniswap.io">Uniswap.io</Link>
  </Flex>
);

export default Footer;
