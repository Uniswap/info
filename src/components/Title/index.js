import React, { useRef } from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { useMedia } from 'react-use'
import { Flex } from 'rebass'
import { Menu as MenuIcon, List, Repeat, Monitor, Sun, Moon } from 'react-feather'

import Link, { BasicLink } from '../Link'
import { AutoColumn } from '../Column'
import { RowFixed, AutoRow } from '../Row'
import SwitchNetworkButton from '../SwitcNetworkButton'
import Logo from '../../assets/logo.svg'
import { ApplicationModal, useModalOpen, useToggleMenuModal } from '../../contexts/Application'
import { useOnClickOutside } from '../../hooks'
import SocialLinks from '../SocialLinks'
import { useDarkModeManager } from '../../contexts/LocalStorage'
import { getDefaultAddLiquidityUrl, addNetworkIdQueryString } from '../../utils'

const TitleWrapper = styled.div`
  text-decoration: none;
  z-index: 10;
  width: 100%;
  &:hover {
    cursor: pointer;
  }
`

const DMMIcon = styled(Link)`
  transition: transform 0.3s ease;
  :hover {
    transform: rotate(-5deg);
  }
`

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.border};
`

const Option = styled.div`
  font-weight: ${({ activeText }) => (activeText ? 600 : 500)};
  font-size: 16px;
  color: ${({ theme, activeText }) => (activeText ? theme.text : theme.subText)};
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-left: 12px;

  :hover {
    color: ${({ theme }) => theme.text};
  }
`

const StyledMenuIcon = styled(MenuIcon)`
  path {
    stroke: ${({ theme }) => theme.text1};
  }
`

const StyledMenuButton = styled.button`
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  margin: 0 0 0 24px;
  padding: 0;
  height: 35px;
  color: ${({ theme }) => theme.menu};

  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
  }

  svg {
    margin-top: 2px;
  }
`

const MenuFlyout = styled.span`
  width: fit-content;
  background-color: ${({ theme }) => theme.background};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: fixed;
  top: 4rem;
  right: 1rem;
  z-index: 9999;

  @media screen and (max-width: 960px) {
    top: 5rem;
  }
`

const HeaderText = styled.div`
  margin-right: 0.75rem;
  font-size: 0.75rem;
  display: inline-box;
  display: -webkit-inline-box;
  a {
    color: ${({ theme }) => theme.subText};
  }

  a:hover {
    color: ${({ theme }) => theme.text};
  }
`

export default function Title() {
  const history = useHistory()
  const below1080 = useMedia('(max-width: 1080px)')
  const node = useRef()
  const [isDark, toggleDarkMode] = useDarkModeManager()
  const menuModalOpen = useModalOpen(ApplicationModal.MENU)
  const toggleMenuModal = useToggleMenuModal()
  useOnClickOutside(node, menuModalOpen ? toggleMenuModal : undefined)

  return (
    <TitleWrapper ref={node}>
      <Flex alignItems="center" style={{ justifyContent: 'space-between' }}>
        <RowFixed>
          <DMMIcon id="link" onClick={() => history.push('/')}>
            <img width={below1080 ? '80px' : '120px'} src={Logo} alt="logo" />
          </DMMIcon>
        </RowFixed>
        {below1080 && (
          <RowFixed style={{ alignItems: 'center' }}>
            <BasicLink to="/home">
              <Option activeText={history.location.pathname === '/home' ?? undefined}>Summary</Option>
            </BasicLink>
            <BasicLink to="/tokens">
              <Option
                activeText={
                  (history.location.pathname.split('/')[1] === 'tokens' ||
                    history.location.pathname.split('/')[1] === 'token') ??
                  undefined
                }
              >
                Tokens
              </Option>
            </BasicLink>
            <BasicLink to="/pairs">
              <Option
                activeText={
                  (history.location.pathname.split('/')[1] === 'pairs' ||
                    history.location.pathname.split('/')[1] === 'pair') ??
                  undefined
                }
              >
                Pairs
              </Option>
            </BasicLink>

            <StyledMenuButton onClick={toggleMenuModal}>
              <StyledMenuIcon />
            </StyledMenuButton>
          </RowFixed>
        )}
      </Flex>

      {menuModalOpen && (
        <MenuFlyout>
          <AutoColumn gap="1.25rem">
            <AutoRow style={{ width: '90%' }}>
              <SwitchNetworkButton />
            </AutoRow>

            <BasicLink to="/accounts">
              <Option
                activeText={
                  (history.location.pathname.split('/')[1] === 'accounts' ||
                    history.location.pathname.split('/')[1] === 'account') ??
                  undefined
                }
                style={{ marginLeft: 0 }}
              >
                <List size={20} style={{ marginRight: '.75rem' }} />
                Wallet Data
              </Option>
            </BasicLink>

            <Link href={addNetworkIdQueryString(process.env.REACT_APP_DMM_SWAP_URL)} external>
              <Option style={{ marginLeft: 0 }}>
                <Repeat size={20} style={{ marginRight: '.75rem' }} />
                Trade
              </Option>
            </Link>

            <Link href={addNetworkIdQueryString(getDefaultAddLiquidityUrl())} external>
              <Option style={{ marginLeft: 0 }}>
                <Monitor size={20} style={{ marginRight: '.75rem' }} />
                Liquidity
              </Option>
            </Link>

            <Divider />

            <Option onClick={toggleDarkMode} style={{ marginLeft: 0 }}>
              {!isDark ? (
                <Sun size={16} style={{ marginRight: '.75rem' }} />
              ) : (
                <Moon size={16} style={{ marginRight: '.75rem' }} />
              )}
              {isDark ? 'Light Theme' : 'Dark Theme'}
            </Option>
          </AutoColumn>

          <AutoColumn gap="0.5rem" style={{ marginTop: '4rem' }}>
            <HeaderText>
              <Link href="https://github.com/dynamic-amm/dmm-info" external>
                Github
              </Link>
            </HeaderText>
            <HeaderText>
              <Link href="https://kyber.org/vote" external>
                KyberDAO
              </Link>
            </HeaderText>
            <HeaderText>
              <Link href="https://files.kyber.network/DMM-Feb21.pdf" external>
                DMM Litepaper
              </Link>
            </HeaderText>
            <HeaderText>
              <Link href="https://kyber.network/" external>
                Kyber Network
              </Link>
            </HeaderText>
            <SocialLinks />
            <HeaderText>
              <Link>(c) dmm.exchange</Link>
            </HeaderText>
          </AutoColumn>
        </MenuFlyout>
      )}
    </TitleWrapper>
  )
}
