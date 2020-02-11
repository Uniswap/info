import React, { useState, useEffect, useMemo } from "react"
import styled from "styled-components"

import Row from "../Row"
import TokenLogo from "../TokenLogo"
import { Search as SearchIcon } from "react-feather"
import { ChevronDown as ArrowDown } from "react-feather"
import { BasicLink } from "../Link"

import { useAllTokenData } from "../../contexts/TokenData"
import { useAllPairs } from "../../contexts/PairData"

const Wrapper = styled.div`
  display: flex;
  position: relative;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  padding: ${({ large }) => (large ? "12px" : "8px 16px")};
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.4);
  border-bottom-right-radius: ${({ open }) => (open ? "0px" : "12px")};
  border-bottom-left-radius: ${({ open }) => (open ? "0px" : "12px")};
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
  color: black;
  font-size: ${({ large }) => (large ? "20px" : "16px")};

  ::placeholder {
    color: black;
  }
`

const SearchIconSmall = styled(SearchIcon)`
  height: 16px;
  width: 16px;
  margin-left: 16px;
`

const SearchIconLarge = styled(SearchIcon)`
  height: 20px;
  width: 20px;
  margin-right: 16px;
`

const ArrowIconStyled = styled(ArrowDown)`
  position: absolute;
  right: 16px;
  height: 24px;
  width: 24px;
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

const WrapperSmall = styled(Wrapper)`
  width: 240px;
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

const Tokens = styled.div``

export default function Search() {
  return (
    <WrapperSmall>
      <Input placeholder={"Search pools and accounts..."}></Input>
      <SearchIconSmall />
    </WrapperSmall>
  )
}

export const GlobalSearch = () => {
  const allTokens = useAllTokenData()
  const allPairs = useAllPairs()
  const [showMenu, toggleMenu] = useState(false)
  const [value, setValue] = useState("")
  const [showShadow, toggleShadow] = useState(false)
  const [showBottomShadow, toggleBottomShadow] = useState(false)

  useEffect(() => {
    if (value !== "") {
      toggleMenu(true)
    } else {
      toggleMenu(false)
    }
  }, [value])

  const escapeStringRegexp = string => string

  const filteredTokenList = useMemo(() => {
    return Object.keys(allTokens).filter(address => {
      const regexMatches = Object.keys(allTokens[address]).map(
        tokenEntryKey => {
          const isAddress = value.slice(0, 2) === "0x"
          if (tokenEntryKey === "id" && isAddress) {
            return allTokens[address][tokenEntryKey].match(
              new RegExp(escapeStringRegexp(value), "i")
            )
          }
          if (tokenEntryKey === "symbol" && !isAddress) {
            return allTokens[address][tokenEntryKey].match(
              new RegExp(escapeStringRegexp(value), "i")
            )
          }
          return false
        }
      )
      return regexMatches.some(m => m)
    })
  }, [allTokens, value])

  const filteredPairList = useMemo(() => {
    return Object.keys(allPairs).filter(pair => {
      const regexMatches = Object.keys(allPairs[pair]).map(field => {
        const isAddress = value.slice(0, 2) === "0x"
        if (field === "id" && isAddress) {
          return allPairs[pair][field].match(
            new RegExp(escapeStringRegexp(value), "i")
          )
        }
        if (field === "token0") {
          return allPairs[pair][field].symbol.match(
            new RegExp(escapeStringRegexp(value), "i")
          )
        }
        if (field === "token1") {
          return allPairs[pair][field].symbol.match(
            new RegExp(escapeStringRegexp(value), "i")
          )
        }
        return false
      })
      return regexMatches.some(m => m)
    })
  }, [allPairs, value])

  const trendingByVolume = useMemo(() => {
    return Object.keys(allTokens)
      .sort((a, b) => {
        return a.oneDayVolumeETH > b.oneDayVolumeETH
      })
      .slice(0, 5)
  }, [allTokens])

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

  return (
    <div style={{ height: "60px", zIndex: "30", position: "relative" }}>
      <Wrapper open={showMenu} shadow={true} large={true}>
        <SearchIconLarge />
        <Input
          large={true}
          type={"text"}
          placeholder={"Search all Uniswap pools and accounts..."}
          value={value}
          onChange={e => {
            setValue(e.target.value)
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
          <Tokens shadow={showShadow}>
            {Object.keys(filteredTokenList).length === 0 && (
              <MenuItem>No results</MenuItem>
            )}
            {filteredTokenList.slice(0, tokensShown).map(key => {
              return (
                <BasicLink to={"/token/" + key} key={key}>
                  <MenuItem>
                    <TokenLogo address={allTokens[key].id}></TokenLogo>
                    <span>{allTokens[key].name}</span>
                    <span>({allTokens[key].symbol})</span>
                  </MenuItem>
                </BasicLink>
              )
            })}
            {Object.keys(filteredTokenList).length > 3 &&
              Object.keys(filteredTokenList).length >= tokensShown && (
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
          </Tokens>
          <Heading>
            <Gray>Pools</Gray>
          </Heading>
          <Tokens shadow={showBottomShadow}>
            {Object.keys(filteredPairList).length === 0 && (
              <MenuItem>No results</MenuItem>
            )}
            {filteredPairList.slice(0, pairsShown).map(key => {
              return (
                <BasicLink to={"/pair/" + key} key={key}>
                  <MenuItem>
                    <TokenLogo address={allPairs[key].id}></TokenLogo>
                    <span>
                      {allPairs[key].token0.symbol +
                        "-" +
                        allPairs[key].token1.symbol}{" "}
                      Pool
                    </span>
                  </MenuItem>
                </BasicLink>
              )
            })}
            {Object.keys(filteredPairList).length > 3 &&
              Object.keys(filteredPairList).length >= pairsShown && (
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
          </Tokens>
        </Menu>
      )}
    </div>
  )
}
