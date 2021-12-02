import React from 'react'
import 'feather-icons'
import styled from 'styled-components'
import { Text } from 'rebass'
import { AlertTriangle } from 'react-feather'
import { RowBetween, RowFixed } from '../Row'
import { ButtonDark } from '../ButtonStyled'
import { AutoColumn } from '../Column'
import { Hover } from '..'
import Link from '../Link'
import { useMedia } from 'react-use'
import { getNetworkName, getEtherscanLinkText } from '../../utils'
import useTheme from '../../hooks/useTheme'

const WarningWrapper = styled.div`
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.warningBorder};
  background: ${({ theme }) => theme.warningBackground};
  padding: 1.5rem 2.5rem;
  color: ${({ theme }) => theme.warningTextColor};
  display: ${({ show }) => !show && 'none'};
  margin: 0 2rem 2rem 2rem;
  position: relative;

  @media screen and (max-width: 800px) {
    width: 90% !important;
    margin: 0 auto 2rem;
    padding: 1.5rem 1rem;
  }
`

const StyledWarningIcon = styled(AlertTriangle)`
  min-height: 20px;
  min-width: 20px;
  stroke: #ffaf01;
`

export default function Warning({ type, show, setShow, address }) {
  const below800 = useMedia('(max-width: 800px)')

  const textContent = below800 ? (
    <div>
      <Text fontSize={14} fontWeight={500} lineHeight={'155.23%'} mt={'10px'} lineSpacing={'normal'}>
        Anyone can create and name any ERC20 token on {getNetworkName()}, including creating fake versions of existing
        tokens that claim to represent projects that do not have a token.
      </Text>
      <Text fontSize={14} fontWeight={500} lineHeight={'155.23%'} mt={'10px'}>
        Similar to {getEtherscanLinkText()}, this site automatically tracks analytics for all ERC20 tokens independent
        of token integrity. Please do your own research before interacting with any ERC20 token.
      </Text>
    </div>
  ) : (
    <Text fontSize={14} fontWeight={500} lineHeight={'155.23%'} mt={'10px'} lineSpacing={'normal'}>
      Anyone can create and name any ERC20 token on {getNetworkName()}, including creating fake versions of existing
      tokens that claim to represent projects that do not have a token. Similar to {getEtherscanLinkText()}, this site
      automatically tracks analytics for all ERC20 tokens independent of token integrity. Please do your own research
      before interacting with any ERC20 token.
    </Text>
  )

  const contractTypeLabel = type === 'token' ? 'token' : 'pool'
  const theme = useTheme()

  return (
    <WarningWrapper show={show}>
      <AutoColumn gap="4px">
        <RowFixed>
          <StyledWarningIcon />
          <Text fontWeight={500} fontSize={16} color={'#ffaf01'} lineHeight={'145.23%'} ml={'10px'}>
            Token Safety Reminder
          </Text>
        </RowFixed>
        {textContent}
        {below800 ? (
          <div>
            {type === 'pair' ? (
              <div />
            ) : (
              <Hover style={{ marginTop: '10px' }}>
                <Link
                  lineHeight={'145.23%'}
                  color={theme.primary}
                  href={`${process.env.REACT_APP_ETHERSCAN_URL}/address/${address}`}
                  target="_blank"
                >
                  View {contractTypeLabel} contract on {getEtherscanLinkText()}
                </Link>
              </Hover>
            )}
            <RowBetween style={{ marginTop: '20px' }}>
              <div />
              <ButtonDark color={theme.primary} style={{ minWidth: '140px' }} onClick={() => setShow(false)}>
                I understand
              </ButtonDark>
            </RowBetween>
          </div>
        ) : (
          <RowBetween style={{ marginTop: '10px' }}>
            {type === 'pair' ? (
              <div />
            ) : (
              <Hover>
                <Link
                  lineHeight={'145.23%'}
                  color={theme.primary}
                  href={`${process.env.REACT_APP_ETHERSCAN_URL}/address/${address}`}
                  target="_blank"
                >
                  View {contractTypeLabel} contract on {getEtherscanLinkText()}
                </Link>
              </Hover>
            )}
            <ButtonDark color={theme.primary} style={{ minWidth: '140px' }} onClick={() => setShow(false)}>
              I understand
            </ButtonDark>
          </RowBetween>
        )}
      </AutoColumn>
    </WarningWrapper>
  )
}
