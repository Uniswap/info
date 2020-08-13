import React from 'react'
import { Flex } from 'rebass'

import Link from '../Link'

const links = [
  { url: 'https://mooniswap.exchange', text: 'Exchange' },
  { url: 'https://github.com/CryptoManiacsZone/mooniswap-info', text: 'Code' }
]

const FooterLink = ({ children, ...rest }) => (
  <Link external color="mooniswappink" fontWeight={500} fontSize={12} mr={'8px'} {...rest}>
    {children}
  </Link>
)

const Footer = () => (
  <Flex as="footer" p={24}>
    {links.map((link, index) => (
      <FooterLink key={index} href={link.url}>
        {link.text}
      </FooterLink>
    ))}
  </Flex>
)

export default Footer
