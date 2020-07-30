import React from 'react'
import styled from 'styled-components'
import { Text, Box } from 'rebass'

import Link from './Link'

import { urls } from '../utils'

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

export const SideBar = styled.span`
  display: grid;
  grid-gap: 24px;
  position: sticky;
  top: 4rem;
`

export const SubNav = styled.ul`
  list-style: none;
  position: sticky;
  top: 8.5rem;
  padding: 0px;
  margin-top: 0px;
`
export const SubNavEl = styled.li`
  list-style: none;
  display: flex;
  margin-bottom: 1rem;
  width: 100%;
  font-weight: ${({ isActive }) => (isActive ? 600 : 500)};

  :hover {
    cursor: pointer;
  }
`

export const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 100px;
  max-width: 1440px;
  padding: 0 24px;
  padding-bottom: 80px;
`

export const ContentWrapper = styled.div`
  display: grid;
  justify-content: start;
  align-items: start;
  grid-template-columns: 180px 1fr;
  grid-gap: 24px;

  @media screen and (max-width: 1180px) {
    grid-template-columns: 1fr;
  }
`

export const ContentWrapperLarge = styled.div`
  display: grid;
  justify-content: start;
  align-items: start;
  grid-template-columns: 180px 1fr;
  grid-gap: 24px;

  @media screen and (max-width: 1282px) {
    grid-template-columns: 1fr;
  }
`

export const FixedMenu = styled.div`
  width: 100%;
  z-index: 99;
  position: sticky;
  top: -6rem;
  padding: 1.5rem 0;
  background-color: white;
  border-bottom: 1px solid ${({ theme }) => theme.bg3};
  margin-bottom: 2rem;
`

export { Hint, Divider, Address, EmptyCard }
