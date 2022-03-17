import React, { useRef } from 'react'
import styled from 'styled-components'
import SwitchNetworkButton from './SwitcNetworkButton'
import { useSessionStart } from '../contexts/Application'
import { Flex, Text } from 'rebass'
import useTheme from '../hooks/useTheme'
import { Menu, Repeat } from 'react-feather'
import { ButtonEmpty } from './ButtonStyled'
import { useOnClickOutside } from '../hooks'
import { ApplicationModal, useModalOpen, useToggleMenuModal } from '../contexts/Application'
import Wallet from './Icons/Wallet'
import ThemeToggle from './ThemeToggle'
import SocialLinks from './SocialLinks'
import Link, { BasicLink } from './Link'
import { useNetworksInfo } from '../contexts/NetworkInfo'
import { useParams } from 'react-router-dom'

const Wrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 72px;
  display: none;
  justify-content: space-between;
  padding: 0 16px;
  align-items: center;
  z-index: 999;
  filter: drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.1));

  background: ${({ theme }) => theme.background};

  @media screen and (max-width: 1080px) {
    display: flex;
  }

  a {
    color: ${({ theme }) => theme.subText};
  }
`

const PollingDot = styled.div`
  width: 8px;
  height: 8px;
  min-height: 8px;
  min-width: 8px;
  margin-right: 0.5rem;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.green1};
`

const MenuFlyout = styled.span`
  width: fit-content;
  background-color: ${({ theme }) => theme.background};
  filter: drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.36));
  border-radius: 8px;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: fixed;
  right: 1rem;
  bottom: 4rem;
  z-index: 9999;
  gap: 24px;
`

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.border};
`

function BottomBar() {
  const seconds = useSessionStart()
  const theme = useTheme()
  const [networksInfo] = useNetworksInfo()

  const node = useRef()
  const menuModalOpen = useModalOpen(ApplicationModal.MENU)
  const toggleMenuModal = useToggleMenuModal()
  useOnClickOutside(node, menuModalOpen ? toggleMenuModal : undefined)
  const { network: currentNetworkURL } = useParams()
  const prefixNetworkURL = currentNetworkURL ? `/${currentNetworkURL}` : ''

  return (
    <Wrapper ref={node}>
      <div>
        <SwitchNetworkButton />
      </div>
      <Flex alignItems='center' color={theme.subText} fontSize='10px'>
        <PollingDot />
        <a href='/'>
          Updated {!!seconds ? seconds + 's' : '-'} ago <br />
        </a>
      </Flex>

      <ButtonEmpty style={{ background: theme.buttonBlack, borderRadius: '8px', padding: '6px' }} onClick={toggleMenuModal}>
        <Menu color={theme.text} />
      </ButtonEmpty>

      {menuModalOpen && (
        <MenuFlyout>
          <BasicLink to={prefixNetworkURL + '/accounts'} onClick={() => toggleMenuModal()}>
            <Flex color={theme.subText} alignItems='center'>
              <Wallet />
              <Text marginLeft='8px'> Wallet Analytics</Text>
            </Flex>
          </BasicLink>
          <Divider />
          <Link href={networksInfo.DMM_SWAP_URL} external onClick={() => toggleMenuModal()}>
            <Flex color={theme.subText} alignItems='center'>
              <Repeat size={16} />
              <Text marginLeft='8px'>Swap</Text>
            </Flex>
          </Link>
          <Divider />
          <ThemeToggle />

          <div>
            <SocialLinks />
            <Text marginTop='12px' fontSize='12px'>
              <Link href='https://kyber.network/' external>
                Kyber Network
              </Link>
            </Text>
          </div>
        </MenuFlyout>
      )}
    </Wrapper>
  )
}

export default BottomBar
