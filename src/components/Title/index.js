import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { useMedia } from 'react-use'
import { Flex, Text } from 'rebass'
import { TrendingUp, Disc, PieChart } from 'react-feather'

import Link, { BasicLink } from '../Link'
import { RowFixed } from '../Row'
import useTheme from '../../hooks/useTheme'
import { useDarkModeManager } from '../../contexts/LocalStorage'

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

const Option = styled.div`
  font-weight: ${({ activeText }) => (activeText ? 600 : 500)};
  font-size: 16px;
  color: ${({ theme, activeText }) => (activeText ? theme.primary : theme.subText)};
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-left: 16px;

  :hover {
    color: ${({ theme }) => theme.text};
  }

  @media screen and (min-width: 500px) {
    margin-left: 32px;
  }
`

export default function Title() {
  const history = useHistory()
  const below1080 = useMedia('(max-width: 1080px)')
  const below600 = useMedia('(max-width: 600px)')
  const theme = useTheme()
  const [isDark] = useDarkModeManager()
  const { network: currentNetworkURL } = useParams()
  const prefixNetworkURL = currentNetworkURL ? `/${currentNetworkURL}` : ''
  const currentUrl = currentNetworkURL ? history.location.pathname.split('/')[2] : history.location.pathname.split('/')[1]

  return (
    <TitleWrapper>
      <Flex alignItems='center' style={{ justifyContent: 'space-between' }}>
        <div>
          <DMMIcon id='link' onClick={() => history.push(prefixNetworkURL + '/')}>
            <img
              width={below1080 ? '110px' : '160px'}
              src={isDark ? '/logo-dark.svg' : '/logo.svg?version=v'}
              alt='logo'
              style={{ marginTop: '2px' }}
            />
          </DMMIcon>
          <Text fontSize='12px' color={theme.subText} textAlign='right' marginTop='-12px'>
            Analytics
          </Text>
        </div>
        {below1080 && (
          <RowFixed style={{ alignItems: 'center' }}>
            <BasicLink to={prefixNetworkURL + '/home'}>
              <Option activeText={currentUrl === 'home' ?? undefined}>
                {!below600 && <TrendingUp size={16} style={{ marginRight: '.75rem' }} />}
                Summary
              </Option>
            </BasicLink>
            <BasicLink to={prefixNetworkURL + '/tokens'}>
              <Option activeText={(currentUrl === 'tokens' || currentUrl === 'token') ?? undefined}>
                {!below600 && <Disc size={16} style={{ marginRight: '.75rem' }} />}
                Tokens
              </Option>
            </BasicLink>
            <BasicLink to={prefixNetworkURL + '/pairs'}>
              <Option activeText={(currentUrl === 'pairs' || currentUrl === 'pair') ?? undefined}>
                {!below600 && <PieChart size={16} style={{ marginRight: '.75rem' }} />}
                Pairs
              </Option>
            </BasicLink>
          </RowFixed>
        )}
      </Flex>
    </TitleWrapper>
  )
}
