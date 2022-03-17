import React from 'react'
import styled from 'styled-components'
import { useHistory, useParams } from 'react-router-dom'
import { TrendingUp, PieChart, Disc, Repeat } from 'react-feather'
import { useMedia } from 'react-use'

import { AutoRow } from '../Row'
import { AutoColumn } from '../Column'
import Title from '../Title'
import { BasicLink } from '../Link'
import Link from '../Link'
import NetworkModal from '../NetworkModal'
import SwitchNetworkButton from '../SwitcNetworkButton'
import { ApplicationModal, useModalOpen, useSessionStart } from '../../contexts/Application'
import { useDarkModeManager } from '../../contexts/LocalStorage'
import SocialLinks from '../SocialLinks'
import ThemeToggle from '../ThemeToggle'
import { addNetworkIdQueryString } from '../../utils'
import Wallet from '../Icons/Wallet'
import { Text } from 'rebass'
import { useNetworksInfo } from '../../contexts/NetworkInfo'

const Wrapper = styled.div`
  height: ${({ isMobile }) => (isMobile ? 'initial' : '100vh')};
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text1};
  padding: 28px 24px;
  position: sticky;
  top: 0px;
  z-index: 999;
  box-sizing: border-box;
  color: ${({ theme }) => theme.bg2};

  @media screen and (max-width: 1072px) {
    padding: 16px;
  }

  @media screen and (max-width: 800px) {
    grid-template-columns: 1fr;
    position: relative;
  }

  @media screen and (max-width: 600px) {
    padding: 1rem;
  }
`

const Option = styled.div`
  font-weight: ${({ activeText }) => (activeText ? 600 : 500)};
  font-size: 16px;
  color: ${({ theme, activeText }) => (activeText ? theme.primary : theme.subText)};
  display: flex;
  align-items: center;
  cursor: pointer;

  :hover {
    color: ${({ theme }) => theme.text};
  }
`

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.border};
`

const DesktopWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
  overflow-y: scroll;
`

const MobileWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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

const Polling = styled.div`
  display: flex;
  padding: 0.75rem 0;
  font-size: 10px;
  color: ${({ theme }) => theme.subText};
  transition: opacity 0.25s ease;

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
  margin-top: 3px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.green1};
`

function SideNav() {
  const below1080 = useMedia('(max-width: 1080px)')

  const below1180 = useMedia('(max-width: 1180px)')

  const seconds = useSessionStart()

  const [, toggleDarkMode] = useDarkModeManager()

  const networkModalOpen = useModalOpen(ApplicationModal.NETWORK)
  const [networksInfo] = useNetworksInfo()
  const { network: currentNetworkURL } = useParams()
  const prefixNetworkURL = currentNetworkURL ? `/${currentNetworkURL}` : ''
  const history = useHistory()
  const currentUrl = currentNetworkURL ? history.location.pathname.split('/')[2] : history.location.pathname.split('/')[1]
  return (
    <Wrapper isMobile={below1080}>
      {!below1080 ? (
        <DesktopWrapper>
          <AutoColumn gap='2rem'>
            <Title />
            <AutoRow>
              <SwitchNetworkButton />
            </AutoRow>
            {!below1080 && (
              <AutoColumn gap='2rem'>
                <BasicLink to={prefixNetworkURL + `/home`}>
                  <Option activeText={currentUrl === 'home'}>
                    <TrendingUp size={16} style={{ marginRight: '.75rem' }} />
                    Summary
                  </Option>
                </BasicLink>
                <BasicLink to={prefixNetworkURL + `/tokens`}>
                  <Option activeText={currentUrl === 'tokens' || currentUrl === 'token'}>
                    <Disc size={16} style={{ marginRight: '.75rem' }} />
                    Tokens
                  </Option>
                </BasicLink>
                <BasicLink to={prefixNetworkURL + `/pairs`}>
                  <Option activeText={currentUrl === 'pairs' || currentUrl === 'pair'}>
                    <PieChart size={16} style={{ marginRight: '.75rem' }} />
                    Pairs
                  </Option>
                </BasicLink>

                <BasicLink to={prefixNetworkURL + `/accounts`}>
                  <Option activeText={currentUrl === 'accounts' || currentUrl === 'account'}>
                    <Wallet />
                    <Text marginLeft='0.75rem'> Wallet Analytics</Text>
                  </Option>
                </BasicLink>

                <Divider />

                <Link href={addNetworkIdQueryString(networksInfo.DMM_SWAP_URL, networksInfo)} external>
                  <Option>
                    <Repeat size={16} style={{ marginRight: '.75rem' }} />
                    Swap
                  </Option>
                </Link>
              </AutoColumn>
            )}
          </AutoColumn>
          <AutoColumn gap='0.75rem' style={{ marginBottom: '2.5rem', marginTop: '1.5rem' }}>
            <Option onClick={toggleDarkMode}>
              <ThemeToggle />
            </Option>

            <SocialLinks />
            <HeaderText>
              <Link href='https://kyber.network/' external>
                Kyber Network
              </Link>
            </HeaderText>
            {!below1180 && (
              <Polling>
                <PollingDot />
                <a href='/'>
                  Updated {seconds ? seconds + 's' : '-'} ago <br />
                </a>
              </Polling>
            )}
          </AutoColumn>
        </DesktopWrapper>
      ) : (
        <MobileWrapper>
          <Title />
        </MobileWrapper>
      )}

      {networkModalOpen && <NetworkModal />}
    </Wrapper>
  )
}

export default SideNav
