import { useState, useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components/macro'

import Row, { RowFixed } from '../Row'
import TokenLogo from '../TokenLogo'
import { Search as SearchIcon, X } from 'react-feather'
import { BasicLink } from '../Link'

import { useFormatPath } from 'hooks'
import DoubleTokenLogo from '../DoubleLogo'
import { useMedia } from 'react-use'
import { transparentize } from 'polished'
import FormattedName from '../FormattedName'
import { TYPE } from '../../Theme'
import { escapeRegExp } from 'utils'
import { useTranslation } from 'react-i18next'
import { useTokens } from 'state/features/token/selectors'
import { usePairs } from 'state/features/pairs/selectors'
import DataService from 'data/DataService'

const Container = styled.div`
  height: 48px;
  z-index: 30;
  position: relative;

  @media screen and (max-width: 600px) {
    width: 100%;
  }
`

const Wrapper = styled.div`
  display: flex;
  position: relative;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  padding: 12px 16px;
  border-radius: 12px;
  background: ${({ theme }) => transparentize(0.4, theme.bg6)};
  border-bottom-right-radius: ${({ open }) => (open ? '0px' : '12px')};
  border-bottom-left-radius: ${({ open }) => (open ? '0px' : '12px')};
  border: 1px solid ${({ theme }) => theme.bg7};
  z-index: 9999;
  width: 100%;
  min-width: 300px;
  box-sizing: border-box;

  @media screen and (max-width: 500px) {
    background: ${({ theme }) => transparentize(0.4, theme.bg1)};
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
  color: ${({ theme }) => theme.text1};
  font-size: ${({ large }) => (large ? '20px' : '14px')};

  ::placeholder {
    color: ${({ theme }) => theme.text3};
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
  position: absolute;
  right: 10px;
  pointer-events: none;
  color: ${({ theme }) => theme.text3};
`

const CloseIcon = styled(X)`
  height: 20px;
  width: 20px;
  margin-right: 0.5rem;
  position: absolute;
  right: 10px;
  color: ${({ theme }) => theme.text3};
  :hover {
    cursor: pointer;
  }
`

const Menu = styled.div`
  display: flex;
  flex-direction: column;
  z-index: 9999;
  width: 100%;
  top: 50px;
  max-height: 540px;
  overflow: auto;
  left: 0;
  padding-bottom: 20px;
  background: ${({ theme }) => theme.bg6};
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
    background-color: ${({ theme }) => theme.bg2};
  }
`

const Heading = styled(Row)`
  padding: 1rem;
  display: ${({ hide = false }) => hide && 'none'};
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
  const { t } = useTranslation()
  const formatPath = useFormatPath()

  // refs to detect clicks outside modal
  const wrapperRef = useRef()
  const menuRef = useRef()

  const below700 = useMedia('(max-width: 700px)')
  const below470 = useMedia('(max-width: 470px)')
  const below410 = useMedia('(max-width: 410px)')

  const allTokens = useTokens()
  const allPools = usePairs()

  const [showMenu, toggleMenu] = useState(false)
  const [value, setValue] = useState('')
  const [tokenData, setTokenData] = useState([])
  const [poolData, setPoolData] = useState([])
  const [tokensShown, setTokensShown] = useState(3)
  const [pairsShown, setPairsShown] = useState(3)

  const newTokens = useMemo(() => {
    return tokenData.filter(t => !Object.keys(allTokens).includes(t.id))
  }, [allTokens, tokenData])

  const combinedTokens = useMemo(() => {
    return [...newTokens, ...Object.values(allTokens)]
  }, [allTokens, newTokens])

  const tokensForList = useMemo(() => {
    return combinedTokens
      .filter(t => {
        const regexMatches = Object.keys(t).map(tokenEntryKey => {
          const isAddress = value.slice(0, 2) === '0x'
          if (tokenEntryKey === 'address' && isAddress) {
            return t[tokenEntryKey].match(new RegExp(escapeRegExp(value), 'i'))
          }
          if (tokenEntryKey === 'symbol' && !isAddress) {
            return t[tokenEntryKey].match(new RegExp(escapeRegExp(value), 'i'))
          }
          if (tokenEntryKey === 'name' && !isAddress) {
            return t[tokenEntryKey].match(new RegExp(escapeRegExp(value), 'i'))
          }
          return false
        })
        return regexMatches.some(m => m)
      })
      .sort((t0, t1) => (t0.volumeUSD > t1.volumeUSD ? -1 : 1))
  }, [combinedTokens, value])

  const newPools = useMemo(() => {
    return poolData.filter(p => !Object.keys(allPools).includes(p.id))
  }, [allPools, poolData])

  const combinedPools = useMemo(() => {
    return [...newPools, ...Object.values(allPools)]
  }, [allPools, newPools])

  const poolForList = useMemo(() => {
    return combinedPools
      .filter(t => {
        const regexMatches = Object.keys(t || {}).map(key => {
          const isAddress = value.slice(0, 2) === '0x'
          if (key === 'address' && isAddress) {
            return t[key].match(new RegExp(escapeRegExp(value), 'i'))
          }
          if ((key === 'token0' || key === 'token1') && !isAddress) {
            return (
              t[key].name.match(new RegExp(escapeRegExp(value), 'i')) ||
              t[key].symbol.toLocaleLowerCase().match(new RegExp(escapeRegExp(value.toLocaleLowerCase()), 'i'))
            )
          }
          return false
        })
        return regexMatches.some(m => m)
      })
      .sort((p0, p1) => (p0.volumeUSD > p1.volumeUSD ? -1 : 1))
  }, [combinedPools, value])

  const onDismiss = () => {
    setPairsShown(3)
    setTokensShown(3)
    toggleMenu(false)
    setValue('')
  }

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

  // fetch data based on search input
  useEffect(() => {
    async function fetch() {
      try {
        const tokens = await DataService.tokens.searchToken(value ? value.toUpperCase() : '', value)
        const pools = await DataService.pairs.searchPair(
          tokens.data.asSymbol?.map(t => t.id),
          value
        )

        if (tokens.data) {
          setTokenData([...tokens.data.asAddress, ...tokens.data.asName, ...tokens.data.asSymbol])
        }
        if (pools.data) {
          setPoolData([...pools.data.asAddress, ...pools.data.as0, ...pools.data.as1])
        }
      } catch (e) {
        console.log(e)
      }
    }
    if (value && value.length > 0) {
      fetch()
    }
  }, [value])

  useEffect(() => {
    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
    }
  })

  return (
    <Container small={small}>
      <Wrapper open={showMenu} shadow={true} small={small}>
        <Input
          large={!small}
          type={'text'}
          ref={wrapperRef}
          placeholder={
            small
              ? ''
              : below410
              ? t('search')
              : below470
              ? t('searchWhiteSwap')
              : below700
              ? t('searchPairsAndTokens')
              : t('searchWhiteSwapPairsAndTokens')
          }
          value={value}
          onChange={e => {
            setValue(e.target.value)
          }}
          onFocus={() => {
            if (!showMenu) {
              toggleMenu(true)
            }
          }}
        />
        {!showMenu ? <SearchIconLarge /> : <CloseIcon onClick={() => toggleMenu(false)} />}
      </Wrapper>
      <Menu hide={!showMenu} ref={menuRef}>
        <Heading>
          <Gray>{t('pairs')}</Gray>
        </Heading>
        <div>
          {poolForList.length === 0 ? (
            <MenuItem>
              <TYPE.body>{t('noResults')}</TYPE.body>
            </MenuItem>
          ) : (
            poolForList.slice(0, pairsShown).map(pair => {
              //format incorrect names
              return (
                <BasicLink to={formatPath(`/pairs/${pair.id}`)} key={pair.id} onClick={onDismiss}>
                  <MenuItem>
                    <DoubleTokenLogo a0={pair?.token0?.id} a1={pair?.token1?.id} margin={true} />
                    <TYPE.body style={{ marginLeft: '10px' }}>
                      {pair.token0.symbol + '-' + pair.token1.symbol} {t('pair')}
                    </TYPE.body>
                  </MenuItem>
                </BasicLink>
              )
            })
          )}
          <Heading hide={!(poolForList.length > 3 && poolForList.length >= pairsShown)}>
            <Blue
              onClick={() => {
                setPairsShown(pairsShown + 5)
              }}
            >
              {t('seeMore')}
            </Blue>
          </Heading>
        </div>
        <Heading>
          <Gray>{t('tokens')}</Gray>
        </Heading>
        <div>
          {tokensForList.length === 0 ? (
            <MenuItem>
              <TYPE.body>{t('noResults')}</TYPE.body>
            </MenuItem>
          ) : (
            tokensForList.slice(0, tokensShown).map(token => {
              return (
                <BasicLink to={formatPath(`/tokens/${token.id}`)} key={token.id} onClick={onDismiss}>
                  <MenuItem>
                    <RowFixed>
                      <TokenLogo address={token.id} style={{ marginRight: '10px' }} />
                      <FormattedName text={token.name} maxCharacters={20} style={{ marginRight: '6px' }} />
                      (<FormattedName text={token.symbol} maxCharacters={6} />)
                    </RowFixed>
                  </MenuItem>
                </BasicLink>
              )
            })
          )}

          <Heading hide={!(tokensForList.length > 3 && tokensForList.length >= tokensShown)}>
            <Blue
              onClick={() => {
                setTokensShown(tokensShown + 5)
              }}
            >
              {t('seeMore')}
            </Blue>
          </Heading>
        </div>
      </Menu>
    </Container>
  )
}

export default Search
