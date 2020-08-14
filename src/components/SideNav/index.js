import React from 'react'
import styled from 'styled-components'
import { AutoColumn } from '../Column'
import Title from '../Title'
import { BasicLink } from '../Link'
import { useMedia } from 'react-use'
import { transparentize } from 'polished'
import { TYPE } from '../../Theme'
import { withRouter } from 'react-router-dom'

import Logo from '../../assets/logo_white.svg'

import { TrendingUp, List, PieChart, Disc } from 'react-feather'

import Link from '../Link'
import { useSessionStart } from '../../contexts/Application'

const Wrapper = styled.div`
  height: 100vh;
  background-color: ${({ theme }) => transparentize(0.4, theme.bg1)};
  backdrop-filter: blur(20px);
  color: ${({ theme }) => theme.text1};
  padding: 0.5rem 0.5rem 0.5rem 1rem;
  position: sticky;
  top: 0px;
  z-index: 9999;
  box-sizing: border-box;
  background-color: #1b1c22;
  color: ${({ theme }) => theme.bg2};

  @media screen and (max-width: 800px) {
    grid-template-columns: 1fr;
  }

  @media screen and (max-width: 600px) {
    padding: 1rem;
  }
`

const Option = styled.div`
  font-weight: 500;
  font-size: 14px;
  opacity: ${({ activeText }) => (activeText ? 1 : 0.4)};
  color: ${({ theme }) => theme.white};
  display: flex;
  :hover {
    opacity: 1;
  }
`

const MobileWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const HeaderText = styled.div`
  margin-right: 0.75rem;
  font-size: 0.825rem;
  font-weight: 500;
  display: inline-box;
  display: -webkit-inline-box;
  opacity: 0.6;
  :hover {
    opacity: 1;
  }
  a {
    color: ${({ theme }) => theme.white};
  }
`

const Polling = styled.div`
  position: fixed;
  display: flex;
  left: 0;
  bottom: 0;
  padding: 1rem;
  color: white;
  opacity: 0.4;
  transition: opacity 0.25s ease;
  :hover {
    opacity: 1;
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
  const below600 = useMedia('(max-width: 600px)')

  const below1180 = useMedia('(max-width: 1180px)')

  const seconds = useSessionStart()

  console.log(history.location.pathname.split('/')[1])

  return (
    <Wrapper>
      {!below600 ? (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          <AutoColumn gap="1rem" style={{ marginLeft: '1rem', marginTop: '2rem' }}>
            <Title />
            {!below1080 && (
              <AutoColumn gap="1.25rem" style={{ marginTop: '1rem' }}>
                <BasicLink to="/home">
                  <Option activeText={history.location.pathname === '/home' ?? undefined}>
                    <TrendingUp size={20} style={{ marginRight: '.75rem' }} />
                    Overview
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
                    <PieChart size={20} style={{ marginRight: '.75rem' }} />
                    Pairs
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
                    <Disc size={20} style={{ marginRight: '.75rem' }} />
                    Tokens
                  </Option>
                </BasicLink>
                <BasicLink to="/account-lookup">
                  <Option activeText={history.location.pathname === '/account-lookup' ?? undefined}>
                    <List size={20} style={{ marginRight: '.75rem' }} />
                    Accounts
                  </Option>
                </BasicLink>
              </AutoColumn>
            )}
          </AutoColumn>
          <AutoColumn gap="0.5rem" style={{ marginLeft: '1rem', marginBottom: '4rem' }}>
            <HeaderText>
              <Link href="https://uniswap.org" target="_blank">
                Uniswap.org
              </Link>
            </HeaderText>
            <HeaderText>
              <Link href="https://v1.uniswap.info" target="_blank">
                V1 Analytics
              </Link>
            </HeaderText>
            <HeaderText>
              <Link href="https://uniswap.org/docs/v2" target="_blank">
                Docs
              </Link>
            </HeaderText>
            <HeaderText>
              <Link href="https://discord.com/invite/XErMcTq" target="_blank">
                Discord
              </Link>
            </HeaderText>
            <HeaderText>
              <Link href="https://twitter.com/UniswapProtocol" target="_blank">
                Twitter
              </Link>
            </HeaderText>
          </AutoColumn>
          {!below1180 && (
            <Polling style={{ marginLeft: '1rem' }}>
              <PollingDot />
              <TYPE.small color={'white'}>
                Updated {!!seconds ? seconds + 's' : '-'} ago <a href="/">(refresh)</a>
              </TYPE.small>
            </Polling>
          )}
        </div>
      ) : (
        <MobileWrapper>
          <img src={Logo} alt={'logo'} onClick={() => history.push('/home')} />
        </MobileWrapper>
      )}
    </Wrapper>
  )
}

export default withRouter(SideNav)
