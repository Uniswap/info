import React from 'react'
import styled from 'styled-components'
import { Text, Box } from 'rebass'

import Link from './Link'

import { urls } from '../helpers'

const Divider = styled(Box)`
  height: 1px;
  background-color: rgba(43, 43, 43, 0.035);
`

const Hint = ({ children, ...rest }) => (
  <Text fontSize={16} weight={500} {...rest}>
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

export const Hover = styled.div`
  :hover {
    cursor: pointer;
    opacity: ${({ fade }) => fade && '0.7'};
  }
`

const EmptyCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  border-radius: 20px;
  height: ${({ height }) => height && height};
`

export { Hint, Divider, Address, EmptyCard }
