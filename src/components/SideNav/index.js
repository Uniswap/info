import React from 'react'
import styled from 'styled-components'
import { withRouter } from 'react-router-dom'
import { TrendingUp, List, PieChart, Disc, Repeat, Monitor, Sun, Moon } from 'react-feather'
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
import { getDefaultAddLiquidityUrl, addNetworkIdQueryString } from '../../utils'

const Wrapper = styled.div`
  height: ${({ isMobile }) => (isMobile ? 'initial' : '100vh')};
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text1};
  padding: 0.5rem 0.5rem 0.5rem 0.75rem;
  position: sticky;
  top: 0px;
  z-index: 9999;
  box-sizing: border-box;
  color: ${({ theme }) => theme.bg2};

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
  color: ${({ theme, activeText }) => (activeText ? theme.text : theme.subText)};
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
  position: fixed;
  display: flex;
  left: 0;
  bottom: 0;
  padding: 1rem;
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

function SideNav({ history }) {
  const below1080 = useMedia('(max-width: 1080px)')

  const below1180 = useMedia('(max-width: 1180px)')

  const seconds = useSessionStart()

  const [isDark, toggleDarkMode] = useDarkModeManager()

  const networkModalOpen = useModalOpen(ApplicationModal.NETWORK)

  return (
    <Wrapper isMobile={below1080}>
      {!below1080 ? (
        <DesktopWrapper>
          <AutoColumn gap="1rem" style={{ marginLeft: '.75rem', marginTop: '1.5rem' }}>
            <Title />
            <AutoRow style={{ width: '90%' }}>
              <SwitchNetworkButton />
            </AutoRow>
            {!below1080 && (
              <AutoColumn gap="1.25rem" style={{ marginTop: '1rem' }}>
                <BasicLink to="/home">
                  <Option activeText={history.location.pathname === '/home' ?? undefined}>
                    <TrendingUp size={16} style={{ marginRight: '.75rem' }} />
                    Summary
                  </Option>
                </BasicLink>
                <BasicLink to="/tokens">
                  <Option
                    activeText={
                      (history.location.pathname.split('/')[1] === 'tokens' ||
                        history.location.pathname.split('/')[1] === 'token') ??
                      undefined
                    }
                  >
                    <Disc size={16} style={{ marginRight: '.75rem' }} />
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
                    <PieChart size={16} style={{ marginRight: '.75rem' }} />
                    Pairs
                  </Option>
                </BasicLink>

                <BasicLink to="/accounts">
                  <Option
                    activeText={
                      (history.location.pathname.split('/')[1] === 'accounts' ||
                        history.location.pathname.split('/')[1] === 'account') ??
                      undefined
                    }
                  >
                    <List size={16} style={{ marginRight: '.75rem' }} />
                    Wallet Data
                  </Option>
                </BasicLink>

                <Link href={addNetworkIdQueryString(process.env.REACT_APP_DMM_SWAP_URL)} external>
                  <Option>
                    <Repeat size={16} style={{ marginRight: '.75rem' }} />
                    Trade
                  </Option>
                </Link>

                <Link href={addNetworkIdQueryString(getDefaultAddLiquidityUrl())} external>
                  <Option>
                    <Monitor size={16} style={{ marginRight: '.75rem' }} />
                    Liquidity
                  </Option>
                </Link>

                <Divider />

                <Option onClick={toggleDarkMode}>
                  {!isDark ? (
                    <Sun size={16} style={{ marginRight: '.75rem' }} />
                  ) : (
                    <Moon size={16} style={{ marginRight: '.75rem' }} />
                  )}
                  {isDark ? 'Light Theme' : 'Dark Theme'}
                </Option>
              </AutoColumn>
            )}
          </AutoColumn>
          <AutoColumn gap="0.5rem" style={{ marginLeft: '.75rem', marginBottom: '3.5rem', marginTop: '1.5rem' }}>
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
              <Link>© dmm.exchange</Link>
            </HeaderText>
          </AutoColumn>
          {!below1180 && (
            <Polling style={{ marginLeft: '.5rem' }}>
              <PollingDot />
              <a href="/">
                Updated {!!seconds ? seconds + 's' : '-'} ago <br />
              </a>
            </Polling>
          )}
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

export default withRouter(SideNav)
