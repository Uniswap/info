import { AutoColumn } from 'components/Column'
import Title from 'components/Title'
import { useMedia } from 'react-use'
import { useFormatPath } from 'hooks'
import { TrendingUp, List, PieChart, Disc } from 'react-feather'
import Link from 'components/Link'
import { useDarkModeManager } from 'state/features/user/hooks'
import Toggle from 'components/Toggle'
import { useTranslation } from 'react-i18next'
import NetworkSwitcher from 'components/NetworkSwitcher'
import {
  DesktopWrapper,
  HeaderText,
  MobileWrapper,
  StyledNavButton,
  Wrapper,
  NavigationLink,
  LatestBlockContainer,
  LatestBlockText,
  LatestBlock,
  LatestBlockDot
} from './styled'
import MobileMenu from './MobileMenu'
import { useLatestBlock } from 'state/features/application/selectors'

function SideNav() {
  const { t } = useTranslation()
  const below1080 = useMedia('(max-width: 1080px)')
  const below1180 = useMedia('(max-width: 1180px)')
  const [isDark, toggleDarkMode] = useDarkModeManager()
  const formatPath = useFormatPath()
  const latestBlock = useLatestBlock()

  return (
    <Wrapper isMobile={below1080}>
      {!below1080 ? (
        <DesktopWrapper>
          <AutoColumn gap="1rem">
            <Title />
            <NetworkSwitcher />
            {!below1080 && (
              <AutoColumn style={{ marginTop: '5.25rem' }}>
                <NavigationLink to={formatPath('/')}>
                  <StyledNavButton>
                    <TrendingUp size={20} />
                  </StyledNavButton>
                  {t('sideNav.overview')}
                </NavigationLink>
                <NavigationLink to={formatPath('/tokens')}>
                  <StyledNavButton>
                    <Disc size={20} />
                  </StyledNavButton>
                  {t('sideNav.tokens')}
                </NavigationLink>
                <NavigationLink to={formatPath('/pairs')}>
                  <StyledNavButton>
                    <PieChart size={20} />
                  </StyledNavButton>
                  {t('sideNav.pairs')}
                </NavigationLink>
                <NavigationLink to={formatPath('/accounts')}>
                  <StyledNavButton>
                    <List size={20} />
                  </StyledNavButton>
                  {t('sideNav.accounts')}
                </NavigationLink>
              </AutoColumn>
            )}
          </AutoColumn>
          <AutoColumn gap=".5rem" style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
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
            {!below1180 && (
              <LatestBlockContainer to="/">
                <LatestBlockText>{t('latestBlock')}</LatestBlockText>
                <LatestBlock>{latestBlock}</LatestBlock>
                <LatestBlockDot />
              </LatestBlockContainer>
            )}
          </AutoColumn>
        </DesktopWrapper>
      ) : (
        <MobileWrapper>
          <Title />
          <NetworkSwitcher />
          <MobileMenu />
        </MobileWrapper>
      )}
    </Wrapper>
  )
}

export default SideNav
