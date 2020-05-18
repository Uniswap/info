import React, { useState, useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'

import Row from '../Row'
import TokenLogo from '../TokenLogo'
import { Search as SearchIcon } from 'react-feather'
import { BasicLink } from '../Link'

import { useAllTokenData } from '../../contexts/TokenData'
import { useAllPairs } from '../../contexts/PairData'
import DoubleTokenLogo from '../DoubleLogo'
import { useMedia } from 'react-use'

const Wrapper = styled.div`
  display: flex;
  position: relative;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  padding: ${({ large }) => (large ? '12px' : '12px 16px')};
  /* border: 1px solid ${({ theme }) => theme.inputBackground}; */
  border-radius: 12px;
  background: ${({ theme, large }) => (large ? theme.inputBG : theme.advancedBG)};
  border-bottom-right-radius: ${({ open }) => (open ? '0px' : '12px')};
  border-bottom-left-radius: ${({ open }) => (open ? '0px' : '12px')};
  ${({ large }) =>
    large &&
    ` box-shadow: 0 2.8px 2.8px -9px rgba(0, 0, 0, 0.008), 0 6.7px 6.7px -9px rgba(0, 0, 0, 0.012),
    0 12.5px 12.6px -9px rgba(0, 0, 0, 0.015), 0 22.3px 22.6px -9px rgba(0, 0, 0, 0.018),
    0 41.8px 42.2px -9px rgba(0, 0, 0, 0.022), 0 100px 101px -9px rgba(0, 0, 0, 0.03);`}
`
const Input = styled.input`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  white-space: nowrap;
  background: none;
  border: none;
  outline: none;
  color: ${({ theme }) => theme.textColor};
  font-size: ${({ large }) => (large ? '20px' : '16px')};

  ::placeholder {
    color: ${({ theme }) => theme.textColor};
    font-size: ${({ large }) => (large ? '20px' : '16px')};
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
  z-index: 10;
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

export const Search = (small = false) => {
  const allTokens = useAllTokenData()
  const allPairs = useAllPairs()

  const [showMenu, toggleMenu] = useState(false)
  const [value, setValue] = useState('')
  const [, toggleShadow] = useState(false)
  const [, toggleBottomShadow] = useState(false)

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

  const escapeStringRegexp = string => string

  const filteredTokenList = useMemo(() => {
    return Object.keys(allTokens)
      .sort((a, b) => {
        const tokenA = allTokens[a]
        const tokenB = allTokens[b]
        if (tokenA.totalLiquidityUSD && tokenB.totalLiquidityUSD) {
          return tokenA.totalLiquidityUSD > tokenB.totalLiquidityUSD ? -1 : 1
        }
        if (tokenA.totalLiquidityUSD && !tokenB.totalLiquidityUSD) {
          return -1
        }
        if (!tokenA.totalLiquidityUSD && tokenB.totalLiquidityUSD) {
          return 1
        }
        return 1
      })
      .filter(address => {
        const regexMatches = Object.keys(allTokens[address]).map(tokenEntryKey => {
          const isAddress = value.slice(0, 2) === '0x'
          if (tokenEntryKey === 'id' && isAddress) {
            return allTokens[address][tokenEntryKey].match(new RegExp(escapeStringRegexp(value), 'i'))
          }
          if (tokenEntryKey === 'symbol' && !isAddress) {
            return allTokens[address][tokenEntryKey].match(new RegExp(escapeStringRegexp(value), 'i'))
          }
          return false
        })
        return regexMatches.some(m => m)
      })
  }, [allTokens, value])

  const filteredPairList = useMemo(() => {
    return Object.keys(allPairs)
      .sort((a, b) => {
        const pairA = allPairs[a]
        const pairB = allPairs[b]
        if (pairA.reserveUSD && pairB.reserveUSD) {
          return pairA.reserveUSD > pairB.reserveUSD ? -1 : 1
        }
        if (pairA.reserveUSD && !pairB.reserveUSD) {
          return -1
        }
        if (!pairA.reserveUSD && pairB.reserveUSD) {
          return 1
        }
        return 1
      })
      .filter(pair => {
        const regexMatches = Object.keys(allPairs[pair]).map(field => {
          const isAddress = value.slice(0, 2) === '0x'
          if (field === 'id' && isAddress) {
            return allPairs[pair][field].match(new RegExp(escapeStringRegexp(value), 'i'))
          }
          if (field === 'token0') {
            return allPairs[pair][field].symbol.match(new RegExp(escapeStringRegexp(value), 'i'))
          }
          if (field === 'token1') {
            return allPairs[pair][field].symbol.match(new RegExp(escapeStringRegexp(value), 'i'))
          }
          return false
        })
        return regexMatches.some(m => m)
      })
  }, [allPairs, value])

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
    <div
      style={{
        height: '40px',
        zIndex: '30',
        position: 'relative',
        width: '100%'
      }}
    >
      <Wrapper open={showMenu} shadow={true} large={!small}>
        <SearchIconLarge />
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
              : 'Search all Uniswap pairs and tokens...'
          }
          value={value}
          onChange={e => {
            setValue(e.target.value)
          }}
          onFocus={() => {
            toggleMenu(true)
          }}
        />
      </Wrapper>
      <Menu hide={!showMenu} ref={menuRef}>
        <FilterSection>
          <Gray>Filter Results</Gray>
        </FilterSection>

        <Heading>
          <Gray>Pairs</Gray>
        </Heading>
        <div>
          {Object.keys(filteredPairList).length === 0 && <MenuItem>No results</MenuItem>}
          {filteredPairList.slice(0, pairsShown).map(key => {
            return (
              <BasicLink to={'/pair/' + key} key={key} onClick={onDismiss}>
                <MenuItem>
                  <DoubleTokenLogo a0={allPairs?.[key]?.token0?.id} a1={allPairs?.[key]?.token1?.id} margin={true} />
                  <span>{allPairs[key].token0.symbol + '-' + allPairs[key].token1.symbol} Pair</span>
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
          {filteredTokenList.slice(0, tokensShown).map(key => {
            return (
              <BasicLink to={'/token/' + key} key={key} onClick={onDismiss}>
                <MenuItem>
                  <TokenLogo address={allTokens[key].id}></TokenLogo>
                  <span>{allTokens[key].name}</span>
                  <span>({allTokens[key].symbol})</span>
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
    </div>
  )
}

export default Search
