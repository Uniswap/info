import React, { useState, useEffect, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import { Box, Flex, Text } from 'rebass'
import TokenLogo from '../TokenLogo'
import { CustomLink } from '../Link'
import Row from '../Row'
import { Divider } from '..'

import { formattedNum, formattedPercent } from '../../utils'
import { useMedia } from 'react-use'
import { Link, withRouter } from 'react-router-dom'
import { OVERVIEW_TOKEN_BLACKLIST } from '../../constants'
import FormattedName from '../FormattedName'
import { TYPE } from '../../Theme'
import LocalLoader from '../LocalLoader'
import { useAllTokenData } from '../../contexts/TokenData'
import { NETWORKS_INFO, NETWORKS_INFO_LIST } from '../../constants/networks'
import { aggregateTokens } from '../../utils/aggregateData'
import { MouseoverTooltip } from '../Tooltip'
import { useNetworksInfo } from '../../contexts/NetworkInfo'

dayjs.extend(utc)

const PageButtons = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 1.25rem 0;
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
  grid-template-columns: 1.5fr ${({ isShowNetworkColumn }) => (isShowNetworkColumn ? '75px' : '')} 1fr 1fr;
  grid-template-areas: 'name ${({ isShowNetworkColumn }) => (isShowNetworkColumn ? 'network' : '')} liq vol';
  padding: 0;

  > * {
    justify-content: flex-end;

    &:first-child {
      justify-content: flex-start;
      text-align: left;
      width: 100px;
    }

    &:nth-child(2) {
      justify-content: center;
    }
  }

  @media screen and (min-width: 680px) {
    display: grid;
    grid-gap: 1em;
    grid-template-columns: 2fr ${({ isShowNetworkColumn }) => (isShowNetworkColumn ? '75px' : '')} 1fr 1fr 1fr 1fr;
    grid-template-areas: 'name ${({ isShowNetworkColumn }) => (isShowNetworkColumn ? 'network' : '')} symbol liq price vol ';

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
    grid-template-columns: 2fr ${({ isShowNetworkColumn }) => (isShowNetworkColumn ? '75px' : '')} 1fr 1fr 1fr 1fr 1fr;
    grid-template-areas: 'name ${({ isShowNetworkColumn }) =>
      isShowNetworkColumn ? 'network' : ''} symbol liq vol price change';
  }
`
const TableHeader = styled(DashGrid)`
  background: ${({ theme }) => theme.tableHeader};
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  padding: 20px;
  line-height: 20px;
`

const ListWrapper = styled.div``

const ClickableText = styled(Text)`
  text-align: end;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 500;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
  user-select: none;
  color: ${({ theme }) => theme.subText};

  @media screen and (max-width: 640px) {
    font-size: 0.85rem;
  }
`

const DataText = styled(Flex)`
  align-items: center;
  text-align: center;
  color: ${({ theme }) => theme.text1};

  & > * {
    font-size: 14px;
  }

  @media screen and (max-width: 600px) {
    font-size: 12px;
  }
`

const SORT_FIELD = {
  LIQ: 'totalLiquidityUSD',
  VOL: 'oneDayVolumeUSD',
  SYMBOL: 'symbol',
  NAME: 'name',
  NETWORK: 'network',
  PRICE: 'priceUSD',
  CHANGE: 'priceChangeUSD',
}

// @TODO rework into virtualized list
function TopTokenList({ itemMax = 5 }) {
  const tokens = useAllTokenData()
  const isShowNetworkColumn = tokens?.slice(1).some(Boolean)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const aggregatedTokens = useMemo(() => aggregateTokens(tokens.filter(Boolean)), [JSON.stringify(tokens)])

  // page state
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)

  // sorting
  const [sortDirection, setSortDirection] = useState(true)
  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.LIQ)

  const below1080 = useMedia('(max-width: 1080px)')
  const below680 = useMedia('(max-width: 680px)')
  const below600 = useMedia('(max-width: 600px)')

  const formattedTokens = useMemo(() => {
    return (
      aggregatedTokens &&
      Object.keys(aggregatedTokens)
        .filter(key => {
          return !OVERVIEW_TOKEN_BLACKLIST.includes(key)
        })
        .filter(key => {
          return aggregatedTokens[key]
        })
        .filter(key => aggregatedTokens[key].name !== 'error-token')
        .map(key => aggregatedTokens[key])
    )
  }, [aggregatedTokens])

  const [[networkInfo]] = useNetworksInfo()
  useEffect(() => {
    setPage(1)
  }, [networkInfo])

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
          let valueToCompareA = null
          let valueToCompareB = null
          if (sortedColumn === SORT_FIELD.SYMBOL || sortedColumn === SORT_FIELD.NAME) {
            //reverse order
            valueToCompareB = a[sortedColumn].toLowerCase()
            valueToCompareA = b[sortedColumn].toLowerCase()
          } else if (sortedColumn === SORT_FIELD.NETWORK) {
            //reverse order
            valueToCompareB = NETWORKS_INFO[a.chainId].name
            valueToCompareA = NETWORKS_INFO[b.chainId].name
          } else {
            valueToCompareA = parseFloat(a[sortedColumn])
            valueToCompareB = parseFloat(b[sortedColumn])
          }
          if (valueToCompareA == valueToCompareB) {
            if (a.totalLiquidityUSD == b.totalLiquidityUSD) {
              return (below680 ? a.symbol : a.name).toLowerCase() > (below680 ? b.symbol : b.name).toLowerCase() ? 1 : -1
            }
            return a.totalLiquidityUSD < b.totalLiquidityUSD ? 1 : -1
          }
          return valueToCompareA > valueToCompareB ? (sortDirection ? -1 : 1) * 1 : (sortDirection ? -1 : 1) * -1
        })
        .slice(itemMax * (page - 1), page * itemMax)
    )
  }, [below680, formattedTokens, itemMax, page, sortDirection, sortedColumn])

  const ListItem = useCallback(
    ({ item, index }) => {
      const tokenNetworkInfo = NETWORKS_INFO[item.chainId] || NETWORKS_INFO_LIST[0]
      return (
        <DashGrid style={{ height: '56px' }} focus={true} isShowNetworkColumn={isShowNetworkColumn}>
          <DataText area='name' fontWeight='500'>
            <Row>
              {!below680 && <div style={{ marginRight: '1rem', width: '10px' }}>{index}</div>}
              <TokenLogo address={item.id} networkInfo={tokenNetworkInfo} />
              <CustomLink
                style={{ marginLeft: '16px', whiteSpace: 'nowrap' }}
                to={'/' + tokenNetworkInfo.urlKey + '/token/' + item.id}
              >
                <FormattedName
                  text={below680 ? item.symbol : item.name}
                  maxCharacters={below600 ? 8 : 16}
                  adjustSize={true}
                  link={true}
                />
              </CustomLink>
            </Row>
          </DataText>
          {isShowNetworkColumn && (
            <DataText area='network'>
              <Link to={'/' + tokenNetworkInfo.urlKey}>
                <MouseoverTooltip text={tokenNetworkInfo.name} width='unset'>
                  <img src={tokenNetworkInfo.icon} width={25} />
                </MouseoverTooltip>
              </Link>
            </DataText>
          )}
          {!below680 && (
            <DataText area='symbol' fontWeight='500'>
              <FormattedName text={item.symbol} maxCharacters={6} />
            </DataText>
          )}
          <DataText area='liq'>{formattedNum(item.totalLiquidityUSD, true)}</DataText>
          <DataText area='vol'>{formattedNum(item.oneDayVolumeUSD, true)}</DataText>
          {!below680 && (
            <DataText area='price' fontWeight='500'>
              {formattedNum(item.priceUSD, true)}
            </DataText>
          )}
          {!below1080 && <DataText area='change'>{formattedPercent(item.priceChangeUSD)}</DataText>}
        </DashGrid>
      )
    },
    [below1080, below600, below680, isShowNetworkColumn]
  )

  return (
    <ListWrapper>
      <TableHeader center={true} style={{ height: 'fit-content' }} isShowNetworkColumn={isShowNetworkColumn}>
        <Flex alignItems='center' justifyContent='flexStart'>
          <ClickableText
            area='name'
            fontWeight='500'
            onClick={e => {
              setSortedColumn(SORT_FIELD.NAME)
              setSortDirection(sortedColumn !== SORT_FIELD.NAME ? true : !sortDirection)
            }}
          >
            {below680 ? 'Symbol' : 'Name'} {sortedColumn === SORT_FIELD.NAME ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
        {isShowNetworkColumn && (
          <Flex alignItems='center' justifyContent='center'>
            <ClickableText
              area='network'
              fontWeight='500'
              onClick={e => {
                setSortedColumn(SORT_FIELD.NETWORK)
                setSortDirection(sortedColumn !== SORT_FIELD.NETWORK ? true : !sortDirection)
              }}
            >
              Network {sortedColumn === SORT_FIELD.NETWORK ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        )}
        {!below680 && (
          <Flex alignItems='center'>
            <ClickableText
              area='symbol'
              onClick={e => {
                setSortedColumn(SORT_FIELD.SYMBOL)
                setSortDirection(sortedColumn !== SORT_FIELD.SYMBOL ? true : !sortDirection)
              }}
            >
              Symbol {sortedColumn === SORT_FIELD.SYMBOL ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        )}

        <Flex alignItems='center'>
          <ClickableText
            area='liq'
            onClick={e => {
              setSortedColumn(SORT_FIELD.LIQ)
              setSortDirection(sortedColumn !== SORT_FIELD.LIQ ? true : !sortDirection)
            }}
          >
            Liquidity {sortedColumn === SORT_FIELD.LIQ ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
        <Flex alignItems='center'>
          <ClickableText
            area='vol'
            onClick={e => {
              setSortedColumn(SORT_FIELD.VOL)
              setSortDirection(sortedColumn !== SORT_FIELD.VOL ? true : !sortDirection)
            }}
          >
            Volume (24H)
            {sortedColumn === SORT_FIELD.VOL ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
        {!below680 && (
          <Flex alignItems='center'>
            <ClickableText
              area='price'
              onClick={e => {
                setSortedColumn(SORT_FIELD.PRICE)
                setSortDirection(sortedColumn !== SORT_FIELD.PRICE ? true : !sortDirection)
              }}
            >
              Price {sortedColumn === SORT_FIELD.PRICE ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        )}
        {!below1080 && (
          <Flex alignItems='center'>
            <ClickableText
              area='change'
              onClick={e => {
                setSortedColumn(SORT_FIELD.CHANGE)
                setSortDirection(sortedColumn !== SORT_FIELD.CHANGE ? true : !sortDirection)
              }}
            >
              Price Change (24H)
              {sortedColumn === SORT_FIELD.CHANGE ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        )}
      </TableHeader>
      <Divider />
      {filteredList?.length ? (
        <List p={0}>
          {filteredList.map((item, index) => {
            return (
              <div key={item.id} style={{ padding: '0 20px' }}>
                <ListItem index={(page - 1) * itemMax + index + 1} item={item} />
                <Divider />
              </div>
            )
          })}
        </List>
      ) : (
        <LocalLoader />
      )}
      <PageButtons>
        <div onClick={() => setPage(page === 1 ? page : page - 1)}>
          <Arrow faded={page === 1 ? true : false}>←</Arrow>
        </div>
        <TYPE.body>{'Page ' + page + ' of ' + maxPage}</TYPE.body>
        <div onClick={() => setPage(page === maxPage ? page : page + 1)}>
          <Arrow faded={page === maxPage ? true : false}>→</Arrow>
        </div>
      </PageButtons>
    </ListWrapper>
  )
}

export default withRouter(TopTokenList)
