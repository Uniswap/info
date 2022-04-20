import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { RowBetween, RowFixed } from '../Row'
import { AutoColumn } from '../Column'
import { TYPE } from '../../Theme'
import { useSavedTokens, useSavedPairs, useSavedPools } from '../../contexts/LocalStorage'
import { Hover } from '..'
import AccountSearch from '../AccountSearch'
import { Bookmark, ChevronRight, X } from 'react-feather'
import FormattedName from '../FormattedName'
import { shortenAddress } from '../../utils'
import { NETWORKS_INFO } from '../../constants/networks'

const RightColumn = styled.div`
  position: sticky;
  right: 0;
  top: 0px;
  height: 100vh;
  width: ${({ open }) => (open ? '160px' : '23px')};
  padding: 1.25rem;
  background-color: ${({ theme }) => theme.background};
  z-index: 9999;
  overflow: auto;
  :hover {
    cursor: pointer;
  }
`

const SavedButton = styled(RowBetween)`
  padding-bottom: ${({ open }) => open && '20px'};
  border-bottom: ${({ theme, open }) => open && '1px solid ' + theme.bg3};
  margin-bottom: ${({ open }) => open && '1.25rem'};

  :hover {
    cursor: pointer;
  }
`

const Wrapper = styled.div`
  justify-content: space-between;
  background-color: ${({ theme }) => theme.bg4};
  border-radius: 24px;
  padding: 8px;
  * div {
    color: ${({ theme }) => theme.text10} !important;
  }
`

const ScrollableDiv = styled(AutoColumn)`
  overflow: auto;
  padding-bottom: 60px;
`

const StyledIcon = styled.div`
  color: ${({ theme }) => theme.text2};
`

function PinnedData({ open, setSavedOpen }) {
  const [savedPairs, , removePair] = useSavedPairs()
  const [savedPools, , removePool] = useSavedPools()
  const [savedTokens, , removeToken] = useSavedTokens()

  return !open ? (
    <RightColumn open={open} onClick={() => setSavedOpen(true)}>
      <SavedButton open={open}>
        <StyledIcon>
          <Bookmark size={20} />
        </StyledIcon>
      </SavedButton>
    </RightColumn>
  ) : (
    <RightColumn gap='1rem' open={open}>
      <SavedButton onClick={() => setSavedOpen(false)} open={open}>
        <RowFixed>
          <StyledIcon>
            <Bookmark size={16} />
          </StyledIcon>
          <TYPE.main ml={'4px'}>Saved</TYPE.main>
        </RowFixed>
        <StyledIcon>
          <ChevronRight />
        </StyledIcon>
      </SavedButton>
      <AccountSearch small={true} />
      <AutoColumn gap='40px' style={{ marginTop: '2rem' }}>
        <AutoColumn gap={'12px'}>
          <TYPE.main>Pinned Pairs</TYPE.main>
          {Object.keys(savedPairs).filter(key => {
            return !!savedPairs[key]
          }).length > 0 ? (
            Object.keys(savedPairs)
              .filter(address => {
                return !!savedPairs[address]
              })
              .map(address => {
                const pair = savedPairs[address]
                return (
                  <RowBetween key={pair.address}>
                    <Wrapper>
                      <Link to={'/' + NETWORKS_INFO[pair.chainId].urlKey + '/pair/' + address}>
                        <RowFixed>
                          <img src={NETWORKS_INFO[pair.chainId].icon} width='16px' style={{ marginRight: '4px' }} />
                          <TYPE.header>
                            <FormattedName
                              text={pair.token0Symbol + '/' + pair.token1Symbol}
                              maxCharacters={12}
                              fontSize={'12px'}
                            />
                          </TYPE.header>
                        </RowFixed>
                      </Link>
                    </Wrapper>
                    <Hover onClick={() => removePair(pair.address)}>
                      <StyledIcon>
                        <X size={16} />
                      </StyledIcon>
                    </Hover>
                  </RowBetween>
                )
              })
          ) : (
            <TYPE.light>Pinned pairs will appear here.</TYPE.light>
          )}
        </AutoColumn>

        <AutoColumn gap={'12px'}>
          <TYPE.main>Pinned Pools</TYPE.main>
          {Object.keys(savedPools).filter(key => {
            return !!savedPools[key]
          }).length > 0 ? (
            Object.keys(savedPools)
              .filter(address => {
                return !!savedPools[address]
              })
              .map(address => {
                const pool = savedPools[address]
                return (
                  <RowBetween key={pool.address}>
                    <Wrapper>
                      <Link to={'/' + NETWORKS_INFO[pool.chainId].urlKey + '/pool/' + pool.address}>
                        <RowFixed>
                          <img src={NETWORKS_INFO[pool.chainId].icon} width='16px' style={{ marginRight: '4px' }} />
                          <TYPE.header>
                            <FormattedName text={shortenAddress(pool.address, 3)} maxCharacters={12} fontSize={'12px'} />
                          </TYPE.header>
                        </RowFixed>
                      </Link>
                    </Wrapper>
                    <Hover onClick={() => removePool(pool.address)}>
                      <StyledIcon>
                        <X size={16} />
                      </StyledIcon>
                    </Hover>
                  </RowBetween>
                )
              })
          ) : (
            <TYPE.light>Pinned pools will appear here.</TYPE.light>
          )}
        </AutoColumn>

        <ScrollableDiv gap={'12px'}>
          <TYPE.main>Pinned Tokens</TYPE.main>
          {Object.keys(savedTokens).filter(key => {
            return !!savedTokens[key]
          }).length > 0 ? (
            Object.keys(savedTokens)
              .filter(address => {
                return !!savedTokens[address]
              })
              .map(address => {
                const token = savedTokens[address]
                return (
                  <RowBetween key={address}>
                    <Wrapper>
                      <Link to={'/' + NETWORKS_INFO[token.chainId].urlKey + '/token/' + address}>
                        <RowFixed>
                          <img src={NETWORKS_INFO[token.chainId].icon} width='16px' style={{ marginRight: '4px' }} />
                          <TYPE.header ml={'6px'}>
                            <FormattedName text={token.symbol} maxCharacters={12} fontSize={'12px'} />
                          </TYPE.header>
                        </RowFixed>
                      </Link>
                    </Wrapper>
                    <Hover onClick={() => removeToken(address)}>
                      <StyledIcon>
                        <X size={16} />
                      </StyledIcon>
                    </Hover>
                  </RowBetween>
                )
              })
          ) : (
            <TYPE.light>Pinned tokens will appear here.</TYPE.light>
          )}
        </ScrollableDiv>
      </AutoColumn>
    </RightColumn>
  )
}

export default PinnedData
