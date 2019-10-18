import React from 'react'
import styled from 'styled-components'
import { Text, Box } from 'rebass'

import Link from './Link'
import Panel from './Panel'

import { urls } from '../helpers'

const Header = styled(Panel)`
  display: grid;
  grid-template-columns: 1fr 4fr;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  width: 100%;

  @media (max-width: 640px) {
    margin-bottom: 0;
    grid-template-columns: 1fr 1fr;
    grid-row-gap: 1em;
  }
`

const Divider = styled(Box)`
  height: 1px;
  background-color: rgba(43, 43, 43, 0.05);
`

const Hint = ({ children, ...rest }) => (
  <Text fontSize={12} {...rest}>
    {children}
  </Text>
)

const Address = ({ address, token, ...rest }) => (
  <Link
    color="button"
    href={token ? urls.showToken(address) : urls.showAddress(address)}
    external
    style={{ wordBreak: 'break-all' }}
    {...rest}
  >
    {address}
  </Link>
)

export { Hint, Divider, Header, Address }
