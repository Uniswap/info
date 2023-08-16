import React, { useState, useEffect, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import { formatTime, formattedNum, getEtherScanUrls } from '../../utils'
import { useMedia } from 'react-use'
import { useCurrentCurrency } from '../../contexts/Application'
import { RowFixed, RowBetween } from '../Row'

import LocalLoader from '../LocalLoader'
import { Box, Flex, Text } from 'rebass'
import Link from '../Link'
import { Link as RouterLink } from 'react-router-dom'
import { Divider, EmptyCard } from '..'
import DropdownSelect from '../DropdownSelect'
import FormattedName from '../FormattedName'
import { TYPE } from '../../Theme'
import useTheme from '../../hooks/useTheme'
import { NETWORKS_INFO } from '../../constants/networks'
import { aggregateGlobalTxns } from '../../utils/aggregateData'
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
  color: ${({ theme }) => theme.primary};
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
  grid-template-areas: 'txn ${({ isShowNetworkColumn }) => (isShowNetworkColumn ? 'network' : '')} value time';

  > * {
    justify-content: flex-end;
    width: 100%;

    &:first-child {
      justify-content: flex-start;
      text-align: left;
      width: 100px;
    }

    &:nth-child(2) {
      justify-content: center;
    }
  }

  @media screen and (min-width: 500px) {
    > * {
      &:first-child {
        width: 180px;
      }
    }
  }

  @media screen and (min-width: 780px) {
    grid-template-columns: 2fr ${({ isShowNetworkColumn }) => (isShowNetworkColumn ? '75px' : '')} 1fr 1fr 1fr 1fr;
    grid-template-areas: 'txn ${({ isShowNetworkColumn }) =>
      isShowNetworkColumn ? 'network' : ''} value amountToken amountOther time';

    > * {
      &:first-child {
        width: fit-content;
      }
    }
  }

  @media screen and (min-width: 1080px) {
    grid-template-columns: 2fr ${({ isShowNetworkColumn }) => (isShowNetworkColumn ? '75px' : '')} 1fr 1fr 1fr 1fr 1fr;
    grid-template-areas: 'txn ${({ isShowNetworkColumn }) =>
      isShowNetworkColumn ? 'network' : ''} value amountToken amountOther account time';
  }
`

const TableHeader = styled(DashGrid)`
  background: ${({ theme }) => theme.tableHeader};
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  padding: 12px 20px;
`

const ClickableText = styled(Text)`
  color: ${({ theme }) => theme.subText};
  user-select: none;
  text-align: end;
  white-space: nowrap

  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }

  text-transform: uppercase;
  font-size: 12px;
  font-weight: 500;
`

const DataText = styled(Flex)`
  align-items: center;
  text-align: right;
  color: ${({ theme }) => theme.text1};

  & > * {
    font-size: 1em;
  }

  @media screen and (max-width: 40em) {
    font-size: 0.85rem;
  }
`

const SortText = styled.button`
  cursor: pointer;
  font-weight: 500;
  border: none;
  background-color: transparent;
  padding: 6px 12px;
  color: ${({ active, theme }) => (active ? theme.text1 : theme.subText)};
  background: ${({ active, theme }) => (active ? theme.primary : theme.buttonBlack)};
  outline: none;
  font-size: 12px;
  font-weight: 500;
  border-radius: 999px;
`

const SORT_FIELD = {
  VALUE: 'amountUSD',
  NETWORK: 'chainId',
  AMOUNT0: 'token0Amount',
  AMOUNT1: 'token1Amount',
  TIMESTAMP: 'timestamp',
}

const TXN_TYPE = {
  ALL: 'All',
  SWAP: 'Swaps',
  ADD: 'Adds',
  REMOVE: 'Removes',
}

const ITEMS_PER_PAGE = 5

function getTransactionType(event, symbol0, symbol1) {
  const formattedS0 = symbol0?.length > 8 ? symbol0.slice(0, 7) + '...' : symbol0
  const formattedS1 = symbol1?.length > 8 ? symbol1.slice(0, 7) + '...' : symbol1
  switch (event) {
    case TXN_TYPE.ADD:
      return 'Add ' + formattedS0 + ' and ' + formattedS1
    case TXN_TYPE.REMOVE:
      return 'Remove ' + formattedS0 + ' and ' + formattedS1
    case TXN_TYPE.SWAP:
      return 'Swap ' + formattedS0 + ' for ' + formattedS1
    default:
      return ''
  }
}

// @TODO rework into virtualized list
function TxnList({ transactions, symbol0Override, symbol1Override, color }) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const aggregatedTransactions = useMemo(() => aggregateGlobalTxns(transactions.filter(Boolean)), [JSON.stringify(transactions)])
  const isShowNetworkColumn = transactions?.slice(1).some(Boolean)
  // page state
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)

  // sorting
  const [sortDirection, setSortDirection] = useState(true)
  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.TIMESTAMP)
  const [filteredItems, setFilteredItems] = useState()
  const [txFilter, setTxFilter] = useState(TXN_TYPE.ALL)

  const [currency] = useCurrentCurrency()

  // parse the txns and format for UI
  useEffect(() => {
    if (aggregatedTransactions && aggregatedTransactions.mints && aggregatedTransactions.burns && aggregatedTransactions.swaps) {
      let newTxns = []
      if (aggregatedTransactions.mints?.length > 0) {
        aggregatedTransactions.mints.forEach(mint => {
          let newTxn = {}
          newTxn.hash = mint.transaction.id
          newTxn.timestamp = mint.transaction.timestamp
          newTxn.type = TXN_TYPE.ADD
          newTxn.token0Amount = mint.amount0
          newTxn.token1Amount = mint.amount1
          newTxn.account = mint.to
          newTxn.token0Symbol = mint.pair.token0.symbol
          newTxn.token1Symbol = mint.pair.token1.symbol
          newTxn.amountUSD = mint.amountUSD
          newTxn.chainId = mint.chainId
          return newTxns.push(newTxn)
        })
      }
      if (aggregatedTransactions.burns?.length > 0) {
        aggregatedTransactions.burns.forEach(burn => {
          let newTxn = {}
          newTxn.hash = burn.transaction.id
          newTxn.timestamp = burn.transaction.timestamp
          newTxn.type = TXN_TYPE.REMOVE
          newTxn.token0Amount = burn.amount0
          newTxn.token1Amount = burn.amount1
          newTxn.account = burn.sender
          newTxn.token0Symbol = burn.pair.token0.symbol
          newTxn.token1Symbol = burn.pair.token1.symbol
          newTxn.amountUSD = burn.amountUSD
          newTxn.chainId = burn.chainId
          return newTxns.push(newTxn)
        })
      }
      if (aggregatedTransactions.swaps.length > 0) {
        aggregatedTransactions.swaps.forEach(swap => {
          const netToken0 = swap.amount0In - swap.amount0Out
          const netToken1 = swap.amount1In - swap.amount1Out

          let newTxn = {}

          if (netToken0 < 0) {
            newTxn.token0Symbol = swap.pair.token0.symbol
            newTxn.token1Symbol = swap.pair.token1.symbol
            newTxn.token0Amount = Math.abs(netToken0)
            newTxn.token1Amount = Math.abs(netToken1)
          } else if (netToken1 < 0) {
            newTxn.token0Symbol = swap.pair.token1.symbol
            newTxn.token1Symbol = swap.pair.token0.symbol
            newTxn.token0Amount = Math.abs(netToken1)
            newTxn.token1Amount = Math.abs(netToken0)
          }

          newTxn.hash = swap.transaction.id
          newTxn.timestamp = swap.transaction.timestamp
          newTxn.type = TXN_TYPE.SWAP

          newTxn.amountUSD = swap.amountUSD
          newTxn.account = swap.origin
          newTxn.chainId = swap.chainId
          return newTxns.push(newTxn)
        })
      }

      const filtered = newTxns.filter(item => {
        if (txFilter !== TXN_TYPE.ALL) {
          return item.type === txFilter
        }
        return true
      })
      setFilteredItems(filtered)
      let extraPages = 1
      if (filtered.length % ITEMS_PER_PAGE === 0) {
        extraPages = 0
      }
      if (filtered.length === 0) {
        setMaxPage(1)
      } else {
        setMaxPage(Math.floor(filtered.length / ITEMS_PER_PAGE) + extraPages)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aggregatedTransactions, txFilter])

  const [[networkInfo]] = useNetworksInfo()

  useEffect(() => {
    setPage(1)
  }, [txFilter, networkInfo])

  const filteredList = useMemo(
    () =>
      filteredItems &&
      filteredItems
        .sort((a, b) => {
          let valueToCompareA = null
          let valueToCompareB = null
          if (sortedColumn === SORT_FIELD.NETWORK) {
            valueToCompareA = NETWORKS_INFO[a.chainId].name
            valueToCompareB = NETWORKS_INFO[b.chainId].name
          } else {
            valueToCompareA = parseFloat(a[sortedColumn])
            valueToCompareB = parseFloat(b[sortedColumn])
          }
          if (valueToCompareA > valueToCompareB) return (sortDirection ? -1 : 1) * 1
          if (valueToCompareA < valueToCompareB) return (sortDirection ? -1 : 1) * -1

          if (a.timestamp < b.timestamp) return -1
          if (a.timestamp > b.timestamp) return 1

          if (a.amountUSD < b.amountUSD) return 1
          if (a.amountUSD > b.amountUSD) return -1

          if (a.hash < b.hash) return 1
          if (a.hash > b.hash) return -1

          if (a.token0Symbol < b.token0Symbol) return 1
          if (a.token0Symbol > b.token0Symbol) return -1
        })
        .slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE),
    [filteredItems, page, sortDirection, sortedColumn]
  )
  const below1080 = useMedia('(max-width: 1080px)')
  const below780 = useMedia('(max-width: 780px)')
  const below900 = useMedia('(max-width: 900px)')
  const below1280 = useMedia('(max-width: 1280px)')
  const isShowDropdown = below900 || (!below1080 && below1280)

  const ListItem = useCallback(
    ({ item }) => {
      const urls = getEtherScanUrls(NETWORKS_INFO[item.chainId])
      if (item.token0Symbol === 'WETH') {
        item.token0Symbol = 'ETH'
      }

      if (item.token1Symbol === 'WETH') {
        item.token1Symbol = 'ETH'
      }

      return (
        <DashGrid style={{ height: '56px' }} isShowNetworkColumn={isShowNetworkColumn}>
          <DataText area='txn' fontWeight='500'>
            <Link color={color} external href={urls.showTransaction(item.hash)}>
              {getTransactionType(item.type, item.token1Symbol, item.token0Symbol)}
            </Link>
          </DataText>
          {isShowNetworkColumn && (
            <DataText area='network'>
              <RouterLink to={'/' + NETWORKS_INFO[item.chainId].urlKey}>
                <MouseoverTooltip text={NETWORKS_INFO[item.chainId].name} width='unset'>
                  <img src={NETWORKS_INFO[item.chainId].icon} width={25} />
                </MouseoverTooltip>
              </RouterLink>
            </DataText>
          )}
          <DataText area='value'>
            {currency === 'ETH' ? 'Ξ ' + formattedNum(item.valueETH) : formattedNum(item.amountUSD, true)}
          </DataText>
          {!below780 && (
            <>
              <DataText area='amountOther'>
                {formattedNum(item.token0Amount) + ' '} <FormattedName text={item.token0Symbol} maxCharacters={5} margin={true} />
              </DataText>
              <DataText area='amountToken'>
                {formattedNum(item.token1Amount) + ' '} <FormattedName text={item.token1Symbol} maxCharacters={5} margin={true} />
              </DataText>
            </>
          )}
          {!below1080 && (
            <DataText area='account'>
              <Link color={color} external href={urls.showAddress(item.account)}>
                {item.account && item.account.slice(0, 6) + '...' + item.account.slice(38, 42)}
              </Link>
            </DataText>
          )}
          <DataText area='time'>{formatTime(item.timestamp)}</DataText>
        </DashGrid>
      )
    },
    [below1080, below780, color, currency, isShowNetworkColumn]
  )

  const theme = useTheme()
  return (
    <>
      <TableHeader center={true} style={{ height: 'fit-content' }} isShowNetworkColumn={isShowNetworkColumn}>
        {isShowDropdown ? (
          <RowBetween area='txn'>
            <DropdownSelect options={TXN_TYPE} active={txFilter} setActive={setTxFilter} color={color} />
          </RowBetween>
        ) : (
          <RowFixed area='txn' gap='10px' pl={4} style={{ borderRadius: '999px', background: theme.buttonBlack }}>
            <SortText
              onClick={() => {
                setTxFilter(TXN_TYPE.ALL)
              }}
              active={txFilter === TXN_TYPE.ALL}
            >
              All
            </SortText>
            <SortText
              onClick={() => {
                setTxFilter(TXN_TYPE.SWAP)
              }}
              active={txFilter === TXN_TYPE.SWAP}
            >
              Swaps
            </SortText>
            <SortText
              onClick={() => {
                setTxFilter(TXN_TYPE.ADD)
              }}
              active={txFilter === TXN_TYPE.ADD}
            >
              Adds
            </SortText>
            <SortText
              onClick={() => {
                setTxFilter(TXN_TYPE.REMOVE)
              }}
              active={txFilter === TXN_TYPE.REMOVE}
            >
              Removes
            </SortText>
          </RowFixed>
        )}
        {isShowNetworkColumn && (
          <Flex alignItems='center' justifyContent='flexStart'>
            <ClickableText
              color='textDim'
              area='network'
              onClick={e => {
                setSortedColumn(SORT_FIELD.NETWORK)
                setSortDirection(sortedColumn !== SORT_FIELD.NETWORK ? true : !sortDirection)
              }}
            >
              Network {sortedColumn === SORT_FIELD.NETWORK ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        )}
        <Flex alignItems='center' justifyContent='flexStart'>
          <ClickableText
            color='textDim'
            area='value'
            onClick={e => {
              setSortedColumn(SORT_FIELD.VALUE)
              setSortDirection(sortedColumn !== SORT_FIELD.VALUE ? true : !sortDirection)
            }}
          >
            Total Value {sortedColumn === SORT_FIELD.VALUE ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
        {!below780 && (
          <Flex alignItems='center'>
            <ClickableText
              area='amountToken'
              color='textDim'
              onClick={() => {
                setSortedColumn(SORT_FIELD.AMOUNT0)
                setSortDirection(sortedColumn !== SORT_FIELD.AMOUNT0 ? true : !sortDirection)
              }}
            >
              {symbol0Override ? symbol0Override + ' Amount' : 'Token Amount'}{' '}
              {sortedColumn === SORT_FIELD.AMOUNT0 ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        )}
        <>
          {!below780 && (
            <Flex alignItems='center'>
              <ClickableText
                area='amountOther'
                color='textDim'
                onClick={() => {
                  setSortedColumn(SORT_FIELD.AMOUNT1)
                  setSortDirection(sortedColumn !== SORT_FIELD.AMOUNT1 ? true : !sortDirection)
                }}
              >
                {symbol1Override ? symbol1Override + ' Amount' : 'Token Amount'}{' '}
                {sortedColumn === SORT_FIELD.AMOUNT1 ? (!sortDirection ? '↑' : '↓') : ''}
              </ClickableText>
            </Flex>
          )}
          {!below1080 && (
            <Flex alignItems='center'>
              <TYPE.body area='account' color={theme.subText}>
                ACCOUNT
              </TYPE.body>
            </Flex>
          )}
          <Flex alignItems='center'>
            <ClickableText
              area='time'
              color='textDim'
              onClick={() => {
                setSortedColumn(SORT_FIELD.TIMESTAMP)
                setSortDirection(sortedColumn !== SORT_FIELD.TIMESTAMP ? true : !sortDirection)
              }}
            >
              Time {sortedColumn === SORT_FIELD.TIMESTAMP ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        </>
      </TableHeader>
      <Divider />
      <List p={0}>
        {!filteredList ? (
          <LocalLoader />
        ) : filteredList.length === 0 ? (
          <EmptyCard>No recent transactions found.</EmptyCard>
        ) : (
          filteredList.map((item, index) => {
            return (
              <div
                key={`${item.hash}_${item.token0Symbol}_${item.token0Amount}_${item.token1Symbol}_${item.token1Amount}`}
                style={{ padding: '0 20px' }}
              >
                <ListItem index={index + 1} item={item} />
                <Divider />
              </div>
            )
          })
        )}
      </List>
      <PageButtons>
        <div
          onClick={e => {
            setPage(page === 1 ? page : page - 1)
          }}
        >
          <Arrow faded={page === 1 ? true : false}>←</Arrow>
        </div>
        <TYPE.body>{'Page ' + page + ' of ' + maxPage}</TYPE.body>
        <div
          onClick={e => {
            setPage(page === maxPage ? page : page + 1)
          }}
        >
          <Arrow faded={page === maxPage ? true : false}>→</Arrow>
        </div>
      </PageButtons>
    </>
  )
}

export default TxnList
