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
import { useOutsideClick } from '../../hooks'

const Wrapper = styled.div`
  display: flex;
  position: relative;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  padding: ${({ large }) => (large ? '12px' : '8px 16px')};
  border: 1px solid ${({ theme }) => theme.inputBackground};
  border-radius: 12px;
  background: ${({ theme }) => theme.inputBackground};
  border-bottom-right-radius: ${({ open }) => (open ? '0px' : '12px')};
  border-bottom-left-radius: ${({ open }) => (open ? '0px' : '12px')};
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
      font-size: 16px;
    }
  }
`

const SearchIconLarge = styled(SearchIcon)`
  height: 20px;
  width: 20px;
  margin-right: 4px;
  color: ${({ theme }) => theme.textColor};
`

const Menu = styled.div`
  display: flex;
  flex-direction: column
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
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.04), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04), 0px 24px 32px rgba(0, 0, 0, 0.04);
`

const MenuItem = styled(Row)`
  padding: 1rem;
  font-size: 16px;
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

export const Search = React.forwardRef((props, ref) => {
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
    return Object.keys(allTokens).filter(address => {
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
    return Object.keys(allPairs).filter(pair => {
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

  const innerRef = useRef()
  const [focused, setFocused] = useState(false)
  useOutsideClick(innerRef, val => {
    !focused && toggleMenu(false)
  })

  return (
    <div
      style={{
        height: '40px',
        zIndex: '30',
        position: 'relative',
        width: '100%'
      }}
      ref={innerRef}
    >
      <Wrapper open={showMenu} shadow={true} large={!props.small}>
        <SearchIconLarge />
        <Input
          large={!props.small}
          type={'text'}
          placeholder={
            below410
              ? 'Search...'
              : below470
              ? 'Search Uniswap...'
              : below700
              ? 'Search pools and tokens...'
              : 'Search all Uniswap pools and tokens...'
          }
          value={value}
          onChange={e => {
            setValue(e.target.value)
          }}
          onFocus={() => {
            toggleMenu(true)
            setFocused(true)
          }}
        />
      </Wrapper>
      {showMenu && (
        <Menu>
          <FilterSection>
            <Gray>Filter Results</Gray>
          </FilterSection>
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
            {Object.keys(filteredTokenList).length > 3 && Object.keys(filteredTokenList).length >= tokensShown && (
              <Heading>
                <Blue
                  onClick={() => {
                    setTokensShown(tokensShown + 5)
                  }}
                >
                  See more...
                </Blue>
              </Heading>
            )}
          </div>
          <Heading>
            <Gray>Pools</Gray>
          </Heading>
          <div>
            {Object.keys(filteredPairList).length === 0 && <MenuItem>No results</MenuItem>}
            {filteredPairList.slice(0, pairsShown).map(key => {
              return (
                <BasicLink to={'/pair/' + key} key={key} onClick={onDismiss}>
                  <MenuItem>
                    <DoubleTokenLogo a0={allPairs?.[key]?.token0?.id} a1={allPairs?.[key]?.token1?.id} margin={true} />
                    <span>{allPairs[key].token0.symbol + '-' + allPairs[key].token1.symbol} Pool</span>
                  </MenuItem>
                </BasicLink>
              )
            })}
            {Object.keys(filteredPairList).length > 3 && Object.keys(filteredPairList).length >= pairsShown && (
              <Heading>
                <Blue
                  onClick={() => {
                    setPairsShown(pairsShown + 5)
                  }}
                >
                  See more...
                </Blue>
              </Heading>
            )}
          </div>
        </Menu>
      )}
    </div>
  )
})

export default Search
