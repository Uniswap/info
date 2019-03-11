import React from "react";
import { Flex } from "rebass";

import Link from "../Link";

const links = [
  { url: "https://github.com/Uniswap/uniswap-info", text: "GitHub" },
  { url: "https://uniswap.io", text: "Uniswap" }
];

const FooterLink = props => (
  <Link
    {...props}
    external
    color="text"
    style={{ fontWeight: 500 }}
    fontSize={12}
    mr={"8px"}
  >
    {props.children}
  </Link>
);

const Footer = () => (
  <Flex as="footer" p={24}>
    {links.map((link, index) => (
      <FooterLink key={index} href={link.url}>
        {link.text}
      </FooterLink>
    ))}
  </Flex>
);

export default Footer;
