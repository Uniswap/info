import React, { useState } from 'react'
import styled from 'styled-components'
import { AutoColumn } from '../Column'
import Title from '../Title'
import { BasicLink } from '../Link'
import { useMedia } from 'react-use'
import { TYPE } from '../../Theme'
import { withRouter } from 'react-router-dom'
import { TrendingUp, List, PieChart, Disc } from 'react-feather'
import Link from '../Link'
import { useSessionStart } from '../../contexts/Application'
import Burger from '../Burger'

const Wrapper = styled.div`
  height: ${({ isMobile }) => (isMobile ? 'initial' : '100vh')};
  color: ${({ theme }) => theme.text1};
  padding-top: 35px;
  position: sticky;
  top: 0px;
  z-index: 9999;
  box-sizing: border-box;
  background: ${({ theme }) => theme.bg7};
  color: ${({ theme }) => theme.bg2};

  @media screen and (max-width: 1079px) {
    z-index: 10000;
  }

  @media screen and (max-width: 800px) {
    padding: 20px;
    grid-template-columns: 1fr;
    position: relative;
  }
`

const Option = styled.div`
  font-family: Gilroy-SemiBold;
  font-size: 16px;
  letter-spacing: 0.15px;
  color: ${({ theme }) => theme.white};
  display: flex;
  padding: 18px 0 18px 40px;
  background: ${({ activeText }) => (activeText ? 'rgba(103, 191, 164, 0.4)' : 'transparent')};

  :hover {
    background: rgba(103, 191, 164, 0.4);
  }

  :active {
    background: rgba(103, 191, 164, 0.4);
  }

  @media screen and (max-width: 1079px) {
    padding: 15px 0;
  }
`

const DesktopWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
`

const MobileWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${({ theme }) => theme.bg7};
`

const HeaderText = styled.div`
  margin-right: 0.75rem;
  font-family: Gilroy-Medium;
  display: inline-box;
  display: -webkit-inline-box;

  @media screen and (max-width: 1079px) {
    margin: 0;
  }

  a {
    color: ${({ theme }) => theme.white};
  }
`

const Polling = styled.div`
  position: fixed;
  display: flex;
  align-items: center;
  left: 0;
  bottom: 0;
  padding: 0 0 40px 40px;
  color: white;
  opacity: 0.4;
  transition: opacity 0.25s ease;
  :hover {
    opacity: 1;
  }
  @media screen and (max-width: 1079px) {
    position: static;
    margin: 60px 0 33px;
    padding: 0;
  }
`
const PollingDot = styled.div`
  width: 10px;
  height: 10px;
  min-height: 10px;
  min-width: 10px;
  margin-right: 10px;
  border-radius: 50%;
  background: #56cdb0;
`

const MobileMenu = styled.div`
  display: flex;
  padding-top: 35px;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.bg7};

  position: absolute;
  top: 80px;
  left: 0px;
  transition: all 0.3s;
  transition-property: height;
  transition-duration: 2s;
`

const MenuWrapper = styled.div`
  @media screen and (max-width: 1079px) {
    padding: 0 40px 35px 0;
  }

  @media screen and (max-width: 800px) {
    padding: 0;
  }

  .hide {
    transform: translateY(-100%);
    z-index: -1;
    transition: all 0.4s;
  }

  .show {
    transform: translateY(0%);
    z-index: -1;
    transition: all 0.3s;
  }
`

function SideNav({ history }) {
  const below1080 = useMedia('(max-width: 1080px)')

  const below1180 = useMedia('(max-width: 1180px)')

  const seconds = useSessionStart()

  const [show, setShow] = useState(false)

  return (
    <>
      <Wrapper isMobile={below1080}>
        {!below1080 ? (
          <DesktopWrapper>
            <AutoColumn gap="100px">
              <Title />
              {!below1080 && (
                <AutoColumn>
                  <BasicLink to="/home">
                    <Option activeText={history.location.pathname === '/home' ?? undefined}>
                      <TrendingUp size={20} style={{ marginRight: '21px' }} />
                      Overview
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
                      <Disc size={20} style={{ marginRight: '21px' }} />
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
                      <PieChart size={20} style={{ marginRight: '21px' }} />
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
                      <List size={20} style={{ marginRight: '21px' }} />
                      Accounts
                    </Option>
                  </BasicLink>
                </AutoColumn>
              )}
            </AutoColumn>
            <AutoColumn gap="20px" style={{ marginLeft: '40px', marginBottom: '110px' }}>
              <HeaderText>
                <Link href="#" target="_blank">
                  Docs
                </Link>
              </HeaderText>
              <HeaderText>
                <Link href="#" target="_blank">
                  Discord
                </Link>
              </HeaderText>
              <HeaderText>
                <Link href="#" target="_blank">
                  Twitter
                </Link>
              </HeaderText>
            </AutoColumn>
            {!below1180 && (
              <Polling>
                <PollingDot />
                <a href="/" style={{ color: 'white', opacity: 0.6 }}>
                  <TYPE.small fontSize={12} color="white" fontFamily="Gilroy-Regular">
                    Updated {!!seconds ? seconds + 's' : '-'} ago <br />
                  </TYPE.small>
                </a>
              </Polling>
            )}
          </DesktopWrapper>
        ) : (
          <MenuWrapper>
            <MobileWrapper>
              <Title />
              <Burger show={show} setShow={setShow} />
            </MobileWrapper>
            <MobileMenu className={show ? 'show' : 'hide'}>
              <AutoColumn>
                <BasicLink to="/home">
                  <Option activeText={history.location.pathname === '/home' ?? undefined}>
                    <TrendingUp size={20} style={{ marginRight: '21px' }} />
                    Overview
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
                    <Disc size={20} style={{ marginRight: '21px' }} />
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
                    <PieChart size={20} style={{ marginRight: '21px' }} />
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
                    <List size={20} style={{ marginRight: '21px' }} />
                    Accounts
                  </Option>
                </BasicLink>
              </AutoColumn>
              <AutoColumn gap="12px" style={{ marginTop: '90px' }}>
                <HeaderText>
                  <Link href="#" target="_blank">
                    Docs
                  </Link>
                </HeaderText>
                <HeaderText>
                  <Link href="#" target="_blank">
                    Discord
                  </Link>
                </HeaderText>
                <HeaderText>
                  <Link href="#" target="_blank">
                    Twitter
                  </Link>
                </HeaderText>
              </AutoColumn>
              <Polling>
                <PollingDot />
                <a href="/" style={{ color: 'white', opacity: 0.6 }}>
                  <TYPE.small fontSize={12} color="white" fontFamily="Gilroy-Regular">
                    Updated {!!seconds ? seconds + 's' : '-'} ago <br />
                  </TYPE.small>
                </a>
              </Polling>
            </MobileMenu>
          </MenuWrapper>
        )}
      </Wrapper>
    </>
  )
}

export default withRouter(SideNav)
