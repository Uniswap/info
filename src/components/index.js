import React from 'react'
import styled from 'styled-components'
import { Text, Box } from 'rebass'
import { transparentize } from 'polished'

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
  top: 11.25rem;
  padding: 0px;
  margin-top: 3rem;
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
  /* padding: 0 24px; */
  padding-bottom: 80px;
`

export const ContentWrapper = styled.div`
  display: grid;
  justify-content: start;
  align-items: start;
  grid-template-columns: 1fr 180px;
  grid-gap: 24px;
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  padding: 0 2rem;
  box-sizing: border-box;
  @media screen and (max-width: 1180px) {
    grid-template-columns: 1fr;
    padding: 0 1rem;
  }
`

export const ContentWrapperLarge = styled.div`
  display: grid;
  justify-content: start;
  align-items: start;
  grid-template-columns: 1fr 180px;
  grid-gap: 24px;
  padding: 0 2rem;
  margin: 0 auto;
  box-sizing: border-box;
  max-width: 1440px;
  width: 100%;

  @media screen and (max-width: 1282px) {
    grid-template-columns: 1fr;
    padding: 0 1rem;
  }
`

export const FullWrapper = styled.div`
  display: grid;
  justify-content: start;
  align-items: start;
  grid-template-columns: 1fr;
  grid-gap: 24px;
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  padding: 0 2rem;
  box-sizing: border-box;

  @media screen and (max-width: 1180px) {
    grid-template-columns: 1fr;
    padding: 0 1rem;
  }
`

export const FixedMenu = styled.div`
  width: 100%;
  z-index: 99;
  position: sticky;
  top: 5.25rem;
  padding: 1rem;
  box-sizing: border-box;
  background-color: ${({ theme }) => transparentize(0.6, theme.bg1)};
  backdrop-filter: blur(20px);
  border-bottom: 1px solid ${({ theme }) => theme.bg2};
  margin-bottom: 2rem;
`

export { Hint, Divider, Address, EmptyCard }
