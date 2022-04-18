import styled from 'styled-components/macro'
import { AutoColumn } from '../Column'
import Title from '../Title'
import { BasicLink } from '../Link'
import { useMedia } from 'react-use'
import { darken } from 'polished'
import { TYPE } from '../../Theme'
import { useFormatPath } from 'hooks'
import { useLocation } from 'react-router-dom'
import { TrendingUp, List, PieChart, Disc } from 'react-feather'
import Link from '../Link'
import { useSessionStart } from 'state/features/application/hooks'
import { useDarkModeManager } from 'state/features/user/hooks'
import Toggle from '../Toggle'
import { useTranslation } from 'react-i18next'
import NetworkSwitcher from 'components/NetworkSwitcher'

const Wrapper = styled.div`
  height: ${({ isMobile }) => (isMobile ? 'initial' : '100vh')};
  background-color: ${({ theme }) => darken(0.05, theme.bg1)};
  color: ${({ theme }) => theme.text1};
  position: sticky;
  top: 0px;
  z-index: 9999;
  box-sizing: border-box;
  border-right: 1px solid ${({ theme }) => theme.mercuryGray};
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
  font-weight: 500;
  font-size: 1rem;
  opacity: ${({ activeText }) => (activeText ? 1 : 0.6)};
  color: ${({ activeText, theme }) => (activeText ? theme.blueGrey : theme.text1)};
  display: flex;
  padding: 0.5rem 1.5rem;
  position: relative;
  align-items: center;
  width: 100%;

  :hover {
    opacity: 1;
  }

  ${({ activeText, theme }) =>
    activeText &&
    `
    background: rgba(102, 129, 167, 0.1);
    font-weight: 700;

    > div {
      background: ${theme.blueGrey};

      > svg {
        stroke: ${theme.lightText1};
      }
    }

    :before {
      content: '';
      position: absolute;
      width: .25rem;
      height: 100%;
      top: 0;
      left: 0;
      background: ${theme.blueGrey};
    }
  `}
`

const StyledNavButton = styled.div`
  display: flex;
  border-radius: 100%;
  padding: 8px;
  margin-right: 1rem;
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
`

const HeaderText = styled.div`
  margin-right: 0.75rem;
  font-size: 0.825rem;
  font-weight: 500;
  display: inline-box;
  display: -webkit-inline-box;
  opacity: 0.8;
  :hover {
    opacity: 1;
  }
  a {
    color: ${({ theme }) => theme.text1};
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

function SideNav() {
  const { t } = useTranslation()
  const formatPath = useFormatPath()
  const location = useLocation()

  const below1080 = useMedia('(max-width: 1080px)')
  const below1180 = useMedia('(max-width: 1180px)')

  const seconds = useSessionStart()

  const [isDark, toggleDarkMode] = useDarkModeManager()

  return (
    <Wrapper isMobile={below1080}>
      {!below1080 ? (
        <DesktopWrapper>
          <AutoColumn gap="1rem">
            <Title />
            <NetworkSwitcher />
            {!below1080 && (
              <AutoColumn style={{ marginTop: '5.25rem' }}>
                <BasicLink to={formatPath('/')}>
                  <Option activeText={location.pathname === '/' ?? undefined}>
                    <StyledNavButton>
                      <TrendingUp size={20} />
                    </StyledNavButton>
                    {t('sideNav.overview')}
                  </Option>
                </BasicLink>
                <BasicLink to={formatPath('/tokens')}>
                  <Option
                    activeText={
                      (location.pathname.split('/')[1] === 'tokens' || location.pathname.split('/')[1] === 'token') ??
                      undefined
                    }
                  >
                    <StyledNavButton>
                      <Disc size={20} />
                    </StyledNavButton>
                    {t('sideNav.tokens')}
                  </Option>
                </BasicLink>
                <BasicLink to={formatPath('/pairs')}>
                  <Option
                    activeText={
                      (location.pathname.split('/')[1] === 'pairs' || location.pathname.split('/')[1] === 'pair') ??
                      undefined
                    }
                  >
                    <StyledNavButton>
                      <PieChart size={20} />
                    </StyledNavButton>
                    {t('sideNav.pairs')}
                  </Option>
                </BasicLink>

                <BasicLink to={formatPath('/accounts')}>
                  <Option
                    activeText={
                      (location.pathname.split('/')[1] === 'accounts' ||
                        location.pathname.split('/')[1] === 'account') ??
                      undefined
                    }
                  >
                    <StyledNavButton>
                      <List size={20} />
                    </StyledNavButton>
                    {t('sideNav.accounts')}
                  </Option>
                </BasicLink>
              </AutoColumn>
            )}
          </AutoColumn>
          <AutoColumn gap=".5rem" style={{ marginLeft: '1.5rem', marginBottom: '2.5rem' }}>
            <HeaderText>
              <Link href="https://ws.exchange" target="_blank">
                WS.exchange
              </Link>
            </HeaderText>
            {/* <HeaderText>
              <Link href="https://v1.uniswap.info" target="_blank">
                V1 Analytics
              </Link>
            </HeaderText> */}
            <HeaderText>
              <Link href="https://docs.ws.exchange" target="_blank">
                {t('sideNav.doc')}
              </Link>
            </HeaderText>
            <HeaderText>
              <Link href="https://t.me/whiteswap" target="_blank">
                Telegram
              </Link>
            </HeaderText>
            <HeaderText>
              <Link href="https://discord.com/invite/WDpFBmVJsx" target="_blank">
                Discord
              </Link>
            </HeaderText>
            <HeaderText>
              <Link href="https://twitter.com/WhiteSwapFi" target="_blank">
                Twitter
              </Link>
            </HeaderText>
            <Toggle isActive={isDark} toggle={toggleDarkMode} />
          </AutoColumn>
          {!below1180 && (
            <Polling style={{ marginLeft: '.5rem' }}>
              <PollingDot />
              <a href="/" style={{ color: 'activeColor' }}>
                <TYPE.small>
                  {`${t('updated')} ${seconds ? seconds + 's' : '-'} ${t('ago')}`}
                  <br />
                </TYPE.small>
              </a>
            </Polling>
          )}
        </DesktopWrapper>
      ) : (
        <MobileWrapper>
          <Title />
        </MobileWrapper>
      )}
    </Wrapper>
  )
}

export default SideNav
