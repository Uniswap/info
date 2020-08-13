import React from 'react'
import { withRouter } from 'react-router-dom'
import styled from 'styled-components'
import { AutoColumn } from '../Column'
import Title from '../Title'
import { BasicLink } from '../Link'
import { useMedia } from 'react-use'
import { transparentize } from 'polished'
import { TYPE } from '../../Theme'

import Logo from '../../assets/logo_white.svg'

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
  border-bottom: 1px solid ${({ theme }) => theme.bg3};
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
  font-size: 16px;
  color: ${({ theme, activeText }) => (activeText ? theme.white : theme.text2)};
`

const MobileWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Header = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.text1};
  color: ${({ theme }) => theme.bg1};
  position: sticky;
  top: 0;
  z-index: 9999;
`

const HeaderText = styled.div`
  margin-right: 0.75rem;
  font-size: 0.825rem;
  font-weight: 500;
  display: inline-box;
  display: -webkit-inline-box;
`

const Polling = styled.div`
  position: fixed;
  display: flex;
  /* align-items: center; */
  left: 0;
  bottom: 0;
  padding: 1rem;
  color: white;
`
const PollingDot = styled.div`
  width: 8px;
  height: 8px;
  margin-right: 0.5rem;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.green1};
`

function SubHeader({ history }) {
  const below1080 = useMedia('(max-width: 1080px)')
  const below600 = useMedia('(max-width: 600px)')

  const below1180 = useMedia('(max-width: 1180px)')

  const seconds = useSessionStart()

  return (
    <Wrapper>
      {!below600 ? (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          <AutoColumn gap="1rem" style={{ marginLeft: '1rem', marginTop: '2rem' }}>
            <Title />
            {!below1080 && (
              <AutoColumn gap="1rem">
                <BasicLink to="/home">
                  <Option activeText={history.location.pathname === '/home' ?? undefined}>Overview</Option>
                </BasicLink>
                <BasicLink to="/all-pairs">
                  <Option activeText={history.location.pathname === '/all-pairs' ?? undefined}>Pairs</Option>
                </BasicLink>
                <BasicLink to="/all-tokens">
                  <Option activeText={history.location.pathname === '/all-tokens' ?? undefined}>Tokens</Option>
                </BasicLink>
                <BasicLink to="/account-lookup">
                  <Option activeText={history.location.pathname === '/account-lookup' ?? undefined}>Accounts</Option>
                </BasicLink>
              </AutoColumn>
            )}
          </AutoColumn>
          {/* {!below600 && <Search small={true} />} */}
          <AutoColumn gap="0.5rem" style={{ marginLeft: '1rem', marginBottom: '4rem' }}>
            <HeaderText>
              <Link style={{ color: 'white' }} href="https://v1.uniswap.info" target="_blank">
                V1 Analytics
              </Link>
            </HeaderText>
            <HeaderText>
              <Link style={{ color: 'white' }} href="https://uniswap.org/docs/v2" target="_blank">
                Docs
              </Link>
            </HeaderText>
            <HeaderText>
              <Link style={{ color: 'white' }} href="https://discord.com/invite/XErMcTq" target="_blank">
                Discord
              </Link>
            </HeaderText>
            <HeaderText>
              <Link style={{ color: 'white' }} href="https://twitter.com/UniswapProtocol" target="_blank">
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
          {/* <Search small={true} /> */}
        </MobileWrapper>
      )}
    </Wrapper>
  )
}

export default withRouter(SubHeader)
