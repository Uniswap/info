import React, { useState, useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'

import Row from '../Row'
import TokenLogo from '../TokenLogo'
import { Search as SearchIcon } from 'react-feather'
import { BasicLink } from '../Link'

import { useAllTokenData, useTokenData } from '../../contexts/TokenData'
import { useAllPairData, usePairData } from '../../contexts/PairData'
import DoubleTokenLogo from '../DoubleLogo'
import { useMedia } from 'react-use'
import { useAllPairsInUniswap, useAllTokensInUniswap } from '../../contexts/GlobalData'
import { OVERVIEW_TOKEN_BLACKLIST, OVERVIEW_PAIR_BLACKLIST } from '../../constants'

const Container = styled.div`
  height: 38px;
  z-index: 30;
  position: relative;
`

const Wrapper = styled.div`
  display: flex;
  position: relative;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  padding: 8px 16px;
  border-radius: 12px;
  background: ${({ theme }) => theme.bg2};
  border-bottom-right-radius: ${({ open }) => (open ? '0px' : '12px')};
  border-bottom-left-radius: ${({ open }) => (open ? '0px' : '12px')};
  z-index: 9999;
  width: 300px;

  @media screen and (max-width: 600px) {
    width: 240px;
  }
`
const Input = styled.input`
  position: relative;
  display: flex;
  align-items: center;
  white-space: nowrap;
  background: none;
  border: none;
  outline: none;
  width: 100%;
  color: ${({ theme }) => theme.textColor};
  font-size: ${({ large }) => (large ? '20px' : '16px')};

  ::placeholder {
    color: ${({ theme }) => theme.textColor};
    font-size: 16px;
  }

  @media screen and (max-width: 640px) {
    ::placeholder {
      font-size: 1rem;
    }
  }
`

const SearchIconLarge = styled(SearchIcon)`
  height: 20px;
  width: 20px;
  margin-right: 0.5rem;
  color: ${({ theme }) => theme.textColor};
`

const Menu = styled.div`
  display: flex;
  flex-direction: column;
  z-index: 9999;
  width: 100%;
  top: 50px;
  max-height: 540px;
  overflow: scroll;
  left: 0;
  padding-bottom: 20px;
  background: white;
  border-bottom-right-radius: 12px;
  border-bottom-left-radius: 12px;
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.04), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.04);
  display: ${({ hide }) => hide && 'none'};
`

const MenuItem = styled(Row)`
  padding: 1rem;
  font-size: 0.85rem;
  & > * {
    margin-right: 6px;
  }
  :hover {
    cursor: pointer;
    background-color: #f7f8fa;
  }
`

const Heading = styled(Row)`
  padding: 1rem;
  display: ${({ hide = false }) => hide && 'none'};
`

const FilterSection = styled(Heading)`
  z-index: 32;
  background-color: #f7f8fa;
`

const Gray = styled.span`
  color: #888d9b;
`

const Blue = styled.span`
  color: #2172e5;
  :hover {
    cursor: pointer;
  }
`

export const Search = ({ small = false }) => {
  const allTokens = useAllTokensInUniswap()
  const allTokenData = useAllTokenData()

  const allPairs = useAllPairsInUniswap()
  const allPairData = useAllPairData()

  const [showMenu, toggleMenu] = useState(false)
  const [value, setValue] = useState('')
  const [, toggleShadow] = useState(false)
  const [, toggleBottomShadow] = useState(false)

  // fetch new data on tokens and pairs if needed
  useTokenData(value)
  usePairData(value)

  const below700 = useMedia('(max-width: 700px)')
  const below470 = useMedia('(max-width: 470px)')
  const below410 = useMedia('(max-width: 410px)')

  useEffect(() => {
    if (value !== '') {
      toggleMenu(true)
    } else {
      toggleMenu(false)
    }
  }, [value])

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
  }

  const filteredTokenList = useMemo(() => {
    return allTokens
      ? allTokens
          .sort((a, b) => {
            if (OVERVIEW_TOKEN_BLACKLIST.includes(a.id)) {
              return 1
            }
            if (OVERVIEW_TOKEN_BLACKLIST.includes(b.id)) {
              return -1
            }
            const tokenA = allTokenData[a.id]
            const tokenB = allTokenData[b.id]
            if (tokenA?.oneDayVolumeUSD && tokenB?.oneDayVolumeUSD) {
              return tokenA.oneDayVolumeUSD > tokenB.oneDayVolumeUSD ? -1 : 1
            }
            if (tokenA?.oneDayVolumeUSD && !tokenB?.oneDayVolumeUSD) {
              return -1
            }
            if (!tokenA?.oneDayVolumeUSD && tokenB?.oneDayVolumeUSD) {
              return 1
            }
            return 1
          })
          .filter(token => {
            if (OVERVIEW_TOKEN_BLACKLIST.includes(token.id)) {
              return false
            }
            const regexMatches = Object.keys(token).map(tokenEntryKey => {
              const isAddress = value.slice(0, 2) === '0x'
              if (tokenEntryKey === 'id' && isAddress) {
                return token[tokenEntryKey].match(new RegExp(escapeRegExp(value), 'i'))
              }
              if (tokenEntryKey === 'symbol' && !isAddress) {
                return token[tokenEntryKey].match(new RegExp(escapeRegExp(value), 'i'))
              }
              if (tokenEntryKey === 'name' && !isAddress) {
                return token[tokenEntryKey].match(new RegExp(escapeRegExp(value), 'i'))
              }
              return false
            })
            return regexMatches.some(m => m)
          })
      : []
  }, [allTokenData, allTokens, value])

  const filteredPairList = useMemo(() => {
    return allPairs
      ? allPairs
          .sort((a, b) => {
            const pairA = allPairData[a.id]
            const pairB = allPairData[b.id]
            if (pairA?.trackedReserveETH && pairB?.trackedReserveETH) {
              return parseFloat(pairA.trackedReserveETH) > parseFloat(pairB.trackedReserveETH) ? -1 : 1
            }
            if (pairA?.trackedReserveETH && !pairB?.trackedReserveETH) {
              return -1
            }
            if (!pairA?.trackedReserveETH && pairB?.trackedReserveETH) {
              return 1
            }
            return 0
          })
          .filter(pair => {
            if (OVERVIEW_PAIR_BLACKLIST.includes(pair.id)) {
              return false
            }
            if (value && value.includes(' ')) {
              const pairA = value.split(' ')[0]?.toUpperCase()
              const pairB = value.split(' ')[1]?.toUpperCase()
              return (
                (pair.token0.symbol.includes(pairA) || pair.token0.symbol.includes(pairB)) &&
                (pair.token1.symbol.includes(pairA) || pair.token1.symbol.includes(pairB))
              )
            }
            if (value && value.includes('-')) {
              const pairA = value.split('-')[0]?.toUpperCase()
              const pairB = value.split('-')[1]?.toUpperCase()
              return (
                (pair.token0.symbol.includes(pairA) || pair.token0.symbol.includes(pairB)) &&
                (pair.token1.symbol.includes(pairA) || pair.token1.symbol.includes(pairB))
              )
            }
            const regexMatches = Object.keys(pair).map(field => {
              const isAddress = value.slice(0, 2) === '0x'
              if (field === 'id' && isAddress) {
                return pair[field].match(new RegExp(escapeRegExp(value), 'i'))
              }
              if (field === 'token0') {
                return (
                  pair[field].symbol.match(new RegExp(escapeRegExp(value), 'i')) ||
                  pair[field].name.match(new RegExp(escapeRegExp(value), 'i'))
                )
              }
              if (field === 'token1') {
                return (
                  pair[field].symbol.match(new RegExp(escapeRegExp(value), 'i')) ||
                  pair[field].name.match(new RegExp(escapeRegExp(value), 'i'))
                )
              }
              return false
            })
            return regexMatches.some(m => m)
          })
      : []
  }, [allPairData, allPairs, value])

  useEffect(() => {
    if (Object.keys(filteredTokenList).length > 2) {
      toggleShadow(true)
    } else {
      toggleShadow(false)
    }
  }, [filteredTokenList])

  useEffect(() => {
    if (Object.keys(filteredPairList).length > 2) {
      toggleBottomShadow(true)
    } else {
      toggleBottomShadow(false)
    }
  }, [filteredPairList])

  const [tokensShown, setTokensShown] = useState(0)

  useEffect(() => {
    setTokensShown(Math.min(Object.keys(filteredTokenList).length, 3))
  }, [filteredTokenList])

  const [pairsShown, setPairsShown] = useState(0)

  useEffect(() => {
    setPairsShown(Math.min(Object.keys(filteredPairList).length, 3))
  }, [filteredPairList])

  function onDismiss() {
    setPairsShown(3)
    setTokensShown(3)
    toggleMenu(false)
    setValue('')
  }

  // refs to detect clicks outside modal
  const wrapperRef = useRef()
  const menuRef = useRef()

  const handleClick = e => {
    if (
      !(menuRef.current && menuRef.current.contains(e.target)) &&
      !(wrapperRef.current && wrapperRef.current.contains(e.target))
    ) {
      setPairsShown(3)
      setTokensShown(3)
      toggleMenu(false)
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
    }
  })

  return (
    <Container>
      <Wrapper open={showMenu} shadow={true} small={small}>
        <Input
          large={!small}
          type={'text'}
          ref={wrapperRef}
          placeholder={
            below410
              ? 'Search...'
              : below470
              ? 'Search Uniswap...'
              : below700
              ? 'Search pairs and tokens...'
              : small
              ? 'Search pairs and tokens...'
              : 'Search Uniswap pairs and tokens...'
          }
          value={value}
          onChange={e => {
            setValue(e.target.value)
          }}
          onFocus={() => {
            toggleMenu(true)
          }}
        />
        <SearchIconLarge />
      </Wrapper>
      <Menu hide={!showMenu} ref={menuRef}>
        <FilterSection>
          <Gray>Results</Gray>
        </FilterSection>

        <Heading>
          <Gray>Pairs</Gray>
        </Heading>
        <div>
          {filteredPairList && Object.keys(filteredPairList).length === 0 && <MenuItem>No results</MenuItem>}
          {filteredPairList &&
            filteredPairList.slice(0, pairsShown).map(pair => {
              if (pair?.token0?.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
                pair.token0.name = 'ETH (Wrapped)'
                pair.token0.symbol = 'ETH'
              }
              if (pair?.token1.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
                pair.token1.name = 'ETH (Wrapped)'
                pair.token1.symbol = 'ETH'
              }
              return (
                <BasicLink to={'/pair/' + pair.id} key={pair.id} onClick={onDismiss}>
                  <MenuItem>
                    <DoubleTokenLogo a0={pair?.token0?.id} a1={pair?.token1?.id} margin={true} />
                    <span style={{ marginLeft: '10px' }}>{pair.token0.symbol + '-' + pair.token1.symbol} Pair</span>
                  </MenuItem>
                </BasicLink>
              )
            })}
          <Heading
            hide={!(Object.keys(filteredPairList).length > 3 && Object.keys(filteredPairList).length >= pairsShown)}
          >
            <Blue
              onClick={() => {
                setPairsShown(pairsShown + 5)
              }}
            >
              See more...
            </Blue>
          </Heading>
        </div>
        <Heading>
          <Gray>Tokens</Gray>
        </Heading>
        <div>
          {Object.keys(filteredTokenList).length === 0 && <MenuItem>No results</MenuItem>}
          {filteredTokenList.slice(0, tokensShown).map(token => {
            return (
              <BasicLink to={'/token/' + token.id} key={token.id} onClick={onDismiss}>
                <MenuItem>
                  <TokenLogo address={token.id} style={{ marginRight: '10px' }} />
                  <span>{token.name}</span>
                  <span>({token.symbol})</span>
                </MenuItem>
              </BasicLink>
            )
          })}

          <Heading
            hide={!(Object.keys(filteredTokenList).length > 3 && Object.keys(filteredTokenList).length >= tokensShown)}
          >
            <Blue
              onClick={() => {
                setTokensShown(tokensShown + 5)
              }}
            >
              See more...
            </Blue>
          </Heading>
        </div>
      </Menu>
    </Container>
  )
}

export default Search
