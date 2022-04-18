import { AutoColumn } from '../Column'
import Title from '../Title'
import { BasicLink } from '../Link'
import { useMedia } from 'react-use'
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
import {
  DesktopWrapper,
  HeaderText,
  MobileWrapper,
  Polling,
  PollingDot,
  StyledNavButton,
  Wrapper,
  Option
} from './styled'

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
