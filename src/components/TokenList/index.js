import { useState, useEffect, useMemo } from 'react'
import styled from 'styled-components/macro'

import { Box, Flex, Text } from 'rebass'
import TokenLogo from '../TokenLogo'
import { CustomLink } from '../Link'
import Row from '../Row'
import { Divider } from '..'

import { formattedNum, formattedPercent } from '../../utils'
import { useMedia } from 'react-use'
import { OVERVIEW_TOKEN_BLACKLIST } from '../../constants'
import FormattedName from '../FormattedName'
import { TYPE } from '../../Theme'
import Panel from '../Panel'
import { transparentize } from 'polished'
import { useTranslation } from 'react-i18next'

const PageButtons = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2em;

  @media screen and (max-width: 440px) {
    margin-top: 0.75rem;
  }
`

const Arrow = styled.div`
  color: ${({ theme }) => theme.primary1};
  opacity: ${props => (props.faded ? 0.3 : 1)};
  padding: 0 20px;
  user-select: none;
  :hover {
    cursor: pointer;
  }
`

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;
`

const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 100px 1fr 1fr;
  grid-template-areas: 'name liq vol';
  padding: 1rem 2rem;
  border-top: 1px solid ${({ theme }) => theme.bg7};

  > * {
    justify-content: flex-end;

    &:first-child {
      justify-content: flex-start;
      text-align: left;
      width: 100px;
    }
  }

  @media screen and (max-width: 440px) {
    padding: 0.75rem;
  }

  @media screen and (min-width: 680px) {
    display: grid;
    grid-gap: 1em;
    grid-template-columns: 180px 1fr 1fr 1fr;
    grid-template-areas: 'name symbol liq vol ';

    > * {
      justify-content: flex-end;
      width: 100%;

      &:first-child {
        justify-content: flex-start;
      }
    }
  }

  @media screen and (min-width: 1080px) {
    display: grid;
    grid-gap: 0.5em;
    grid-template-columns: 1.5fr 0.6fr 1fr 1fr 1fr 1fr;
    grid-template-areas: 'name symbol liq vol price change';
  }
`

const ListWrapper = styled.div``

const ClickableText = styled(Text)`
  color: ${({ theme }) => transparentize(0.3, theme.text6)};
  user-select: none;
  text-align: end;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  justify-content: flex-end;

  ${({ active = true }) =>
    active &&
    `
    &:hover {
      opacity: 0.6;
    }
  `}

  @media screen and (max-width: 640px) {
    font-size: 10px;
  }
`

const DataText = styled(Flex)`
  align-items: center;
  text-align: center;
  color: ${({ theme }) => transparentize(0.5, theme.text6)};

  & > * {
    font-size: 14px;
  }

  @media screen and (max-width: 600px) {
    font-size: 12px;
  }

  @media screen and (max-width: 440px) {
    font-size: 10px !important;
  }
`

const SORT_FIELD = {
  LIQ: 'totalLiquidityUSD',
  VOL: 'oneDayVolumeUSD',
  SYMBOL: 'symbol',
  NAME: 'name',
  PRICE: 'priceUSD',
  CHANGE: 'priceChangeUSD'
}

// @TODO rework into virtualized list
function TopTokenList({ tokens, itemMax = 10 }) {
  const { t } = useTranslation()
  // page state
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)

  // sorting
  const [sortDirection, setSortDirection] = useState(true)
  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.LIQ)

  const below1080 = useMedia('(max-width: 1080px)')
  const below680 = useMedia('(max-width: 680px)')
  const below600 = useMedia('(max-width: 600px)')
  const below440 = useMedia('(max-width: 440px)')

  useEffect(() => {
    setMaxPage(1) // edit this to do modular
    setPage(1)
  }, [tokens])

  const formattedTokens = useMemo(() => {
    return (
      tokens &&
      Object.keys(tokens)
        .filter(key => {
          return !OVERVIEW_TOKEN_BLACKLIST.includes(key)
        })
        .map(key => tokens[key])
    )
  }, [tokens])

  useEffect(() => {
    if (tokens && formattedTokens) {
      let extraPages = 1
      if (formattedTokens.length % itemMax === 0) {
        extraPages = 0
      }
      setMaxPage(Math.floor(formattedTokens.length / itemMax) + extraPages)
    }
  }, [tokens, formattedTokens, itemMax])

  const filteredList = useMemo(() => {
    return (
      formattedTokens &&
      formattedTokens
        .sort((a, b) => {
          if (sortedColumn === SORT_FIELD.SYMBOL || sortedColumn === SORT_FIELD.NAME) {
            return a[sortedColumn] > b[sortedColumn] ? (sortDirection ? -1 : 1) * 1 : (sortDirection ? -1 : 1) * -1
          }
          return parseFloat(a[sortedColumn]) > parseFloat(b[sortedColumn])
            ? (sortDirection ? -1 : 1) * 1
            : (sortDirection ? -1 : 1) * -1
        })
        .slice(itemMax * (page - 1), page * itemMax)
    )
  }, [formattedTokens, itemMax, page, sortDirection, sortedColumn])

  const ListItem = ({ item, index }) => {
    return (
      <DashGrid style={{ padding: below440 ? '.75rem' : '.75rem 2rem' }} focus={true}>
        <DataText area="name" fontWeight="500">
          <Row>
            {!below680 && <div style={{ marginRight: '1rem', width: '10px' }}>{index}</div>}
            <TokenLogo address={item.id} />
            <CustomLink style={{ marginLeft: '16px', whiteSpace: 'nowrap' }} to={'/token/' + item.id}>
              <FormattedName
                text={below680 ? item.symbol : item.name}
                maxCharacters={below600 ? 8 : 16}
                adjustSize={true}
                link={true}
                fontSize={below440 ? 10 : 14}
              />
            </CustomLink>
          </Row>
        </DataText>
        {!below680 && (
          <DataText area="symbol" color="text" fontWeight="500">
            <FormattedName text={item.symbol} maxCharacters={5} />
          </DataText>
        )}
        <DataText area="liq">{formattedNum(item.totalLiquidityUSD, true)}</DataText>
        <DataText area="vol">{formattedNum(item.oneDayVolumeUSD, true)}</DataText>
        {!below1080 && (
          <DataText area="price" color="text" fontWeight="500">
            {formattedNum(item.priceUSD, true)}
          </DataText>
        )}
        {!below1080 && <DataText area="change">{formattedPercent(item.priceChangeUSD)}</DataText>}
      </DashGrid>
    )
  }

  return (
    <ListWrapper>
      <Panel
        style={{
          marginTop: below440 ? '.75rem' : '1.5rem',
          padding: 0
        }}
      >
        <DashGrid center={true} style={{ height: 'fit-content', borderTop: 'none' }}>
          <Flex alignItems="center" justifyContent="flexStart">
            <ClickableText
              color="text"
              area="name"
              fontWeight="500"
              onClick={() => {
                setSortedColumn(SORT_FIELD.NAME)
                setSortDirection(sortedColumn !== SORT_FIELD.NAMe ? true : !sortDirection)
              }}
            >
              {below680 ? t('symbol') : t('name')}{' '}
              {sortedColumn === SORT_FIELD.NAME ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
          {!below680 && (
            <Flex alignItems="center">
              <ClickableText
                area="symbol"
                onClick={() => {
                  setSortedColumn(SORT_FIELD.SYMBOL)
                  setSortDirection(sortedColumn !== SORT_FIELD.SYMBOL ? true : !sortDirection)
                }}
              >
                {t('symbol')} {sortedColumn === SORT_FIELD.SYMBOL ? (!sortDirection ? '↑' : '↓') : ''}
              </ClickableText>
            </Flex>
          )}

          <Flex alignItems="center">
            <ClickableText
              area="liq"
              onClick={() => {
                setSortedColumn(SORT_FIELD.LIQ)
                setSortDirection(sortedColumn !== SORT_FIELD.LIQ ? true : !sortDirection)
              }}
            >
              {t('liquidity')} {sortedColumn === SORT_FIELD.LIQ ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
          <Flex alignItems="center">
            <ClickableText
              area="vol"
              onClick={() => {
                setSortedColumn(SORT_FIELD.VOL)
                setSortDirection(sortedColumn !== SORT_FIELD.VOL ? true : !sortDirection)
              }}
            >
              {t('volume24hrs')}
              {sortedColumn === SORT_FIELD.VOL ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
          {!below1080 && (
            <Flex alignItems="center">
              <ClickableText
                area="price"
                onClick={() => {
                  setSortedColumn(SORT_FIELD.PRICE)
                  setSortDirection(sortedColumn !== SORT_FIELD.PRICE ? true : !sortDirection)
                }}
              >
                {t('price')} {sortedColumn === SORT_FIELD.PRICE ? (!sortDirection ? '↑' : '↓') : ''}
              </ClickableText>
            </Flex>
          )}
          {!below1080 && (
            <Flex alignItems="center">
              <ClickableText
                area="change"
                onClick={() => {
                  setSortedColumn(SORT_FIELD.CHANGE)
                  setSortDirection(sortedColumn !== SORT_FIELD.CHANGE ? true : !sortDirection)
                }}
              >
                {t('priceChange24hrs')}
                {sortedColumn === SORT_FIELD.CHANGE ? (!sortDirection ? '↑' : '↓') : ''}
              </ClickableText>
            </Flex>
          )}
        </DashGrid>
        <Divider />
        <List p={0}>
          {filteredList &&
            filteredList.map((item, index) => {
              return (
                <div key={index}>
                  <ListItem key={index} index={(page - 1) * itemMax + index + 1} item={item} />
                  <Divider />
                </div>
              )
            })}
        </List>
      </Panel>
      <PageButtons>
        <div onClick={() => setPage(page === 1 ? page : page - 1)}>
          <Arrow faded={page === 1 ? true : false}>←</Arrow>
        </div>
        <TYPE.body>{`${t('page')} ${page} ${t('of')} ${maxPage}`}</TYPE.body>
        <div onClick={() => setPage(page === maxPage ? page : page + 1)}>
          <Arrow faded={page === maxPage ? true : false}>→</Arrow>
        </div>
      </PageButtons>
    </ListWrapper>
  )
}

export default TopTokenList
