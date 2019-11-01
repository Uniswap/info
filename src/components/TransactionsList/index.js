import React, { useState, useEffect } from 'react'
import { useMedia } from 'react-use'
import dayjs from 'dayjs'
import LocalLoader from '../LocalLoader'
import utc from 'dayjs/plugin/utc'
import { client } from '../../apollo/client'
import { TRANSACTIONS_QUERY_SKIPPABLE } from '../../apollo/queries'
import { Box, Flex, Text } from 'rebass'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import Link from '../Link'
import { Divider } from '../../components'

import { urls, formatTime, Big, formattedNum } from '../../helpers'

dayjs.extend(utc)

const PageButtons = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2em;
  margin-bottom: 2em;
`

const Arrow = styled.div`
  color: #2f80ed;
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
  grid-template-areas: 'action value Time';
  padding: 0 6px;

  > * {
    justify-content: flex-end;
    width: 100%;

    &:first-child {
      justify-content: flex-start;
      text-align: left;
      width: 100px;
    }
  }

  @media screen and (min-width: 40em) {
    max-width: 1280px;
    display: grid;
    grid-gap: 1em;
    grid-template-columns: 180px 1fr 1fr 1fr;
    grid-template-areas: 'action value Account Time';

    > * {
      justify-content: flex-end;
      width: 100%;

      &:first-child {
        justify-content: flex-start;
        width: 180px;
      }
    }
  }

  @media screen and (min-width: 64em) {
    max-width: 1280px;
    display: grid;
    padding: 0 24px;
    grid-gap: 1em;
    grid-template-columns: 1.2fr 1fr 1fr 1fr 1fr 1fr;
    grid-template-areas: 'action value ethAmount tokenAmount Account Time';
  }
`

const ListWrapper = styled.div`
  @media screen and (max-width: 40em) {
    padding-right: 1rem;
    padding-left: 1rem;
  }
`

const CustomLink = styled(Link)`
  margin-left: 0px;
`

const ClickableText = styled(Text)`
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  
  user-select: none;
`

const EmptyTxWrapper = styled.div`
  width: 100%;
  display: flex;
  height: 80px;
  align-items: center;
  justify-content: center;
`

const DataText = styled(Flex)`
  @media screen and (max-width: 40em) {
    font-size: 14px;
  }

  align-items: center;
  text-align: right;

  & > * {
    font-size: 1em;
  }
`

const SORT_FIELD = {
  TIME: 'timestamp',
  USD_VALUE: 'usdAmount',
  ETH_VALUE: 'ethAmount',
  TOKEN_VALUE: 'tokenAmount'
}

// @TODO rework into virtualized list
function TransactionsList({ tokenSymbol, exchangeAddress, price, priceUSD, txFilter, accountInput }) {
  const [txs, setTxs] = useState([])

  const [swaps, SetSwaps] = useState([])

  const [adds, SetAdds] = useState([])

  const [removes, SetRemoves] = useState([])

  const [filteredTxs, SetFilteredTxs] = useState([])

  const [page, setPage] = useState(1)

  const [maxPage, setMaxPage] = useState(1)

  const TXS_PER_PAGE = 10

  const [loading, setLoading] = useState(true)

  const [sortDirection, setSortDirection] = useState(true)

  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.TIME)

  useEffect(() => {
    setMaxPage(1)
    setPage(1)
  }, [exchangeAddress])

  useEffect(() => {
    let extraPages = 1
    if (accountInput !== '') {
      let foundAccounts = []
      for (let x = 0; x < txs.length; x++) {
        if (
          txs[x].user
            .toString()
            .toUpperCase()
            .search(accountInput.toUpperCase()) > -1
        ) {
          foundAccounts.push(txs[x])
        }
      }
      SetFilteredTxs(foundAccounts)
      if (foundAccounts.length % TXS_PER_PAGE === 0) {
        extraPages = 0
      }
      setMaxPage(Math.floor(foundAccounts.length / TXS_PER_PAGE) + extraPages)
    } else {
      SetFilteredTxs(txs)
      if (txs.length % TXS_PER_PAGE === 0) {
        extraPages = 0
      }
      setMaxPage(Math.floor(txs.length / TXS_PER_PAGE) + extraPages)
    }
  }, [accountInput, txs])

  function sortTxs(field) {
    if (field === SORT_FIELD.USD_VALUE) {
      field = SORT_FIELD.ETH_VALUE
    }
    let newTxs = filteredTxs
      .slice()
      .sort((a, b) =>
        parseFloat(a[field]) > parseFloat(b[field]) ? (sortDirection ? -1 : 1) * -1 : (sortDirection ? -1 : 1) * 1
      )
    SetFilteredTxs(newTxs)
    setPage(1)
  }

  useEffect(() => {
    setSortDirection(true)
    switch (txFilter) {
      case 'Add':
        SetFilteredTxs(adds)
        setMaxPage(Math.floor(adds.length / TXS_PER_PAGE) + 1)
        setPage(1)
        break
      case 'Remove':
        SetFilteredTxs(removes)
        setMaxPage(Math.floor(removes.length / TXS_PER_PAGE) + 1)
        setPage(1)
        break
      case 'Swaps':
        SetFilteredTxs(swaps)
        setMaxPage(Math.floor(swaps.length / TXS_PER_PAGE) + 1)
        setPage(1)
        break
      default:
        SetFilteredTxs(txs)
        setMaxPage(Math.floor(txs.length / TXS_PER_PAGE) + 1)
        setPage(1)
        break
    }
  }, [txFilter, adds, removes, swaps, txs])

  /**
   *  Fetch the overall and 24hour data for each exchange
   *
   * Update when exhcange changes
   *
   * Store results in categorized arrays for faster sorting
   *
   */
  useEffect(() => {
    setPage(1)
    let ab = new AbortController()
    setLoading(true)
    async function getTxs() {
      // current time
      const utcEndTime = dayjs()
      let utcStartTime
      utcStartTime = utcEndTime.subtract(1, 'day')
      let startTime = utcStartTime.unix() - 1 // -1 because we filter on greater than in the query
      let data = []
      let skipCount = 0
      let fetchingData = true

      while (fetchingData) {
        ab = new AbortController()
        let result = await client.query({
          query: TRANSACTIONS_QUERY_SKIPPABLE,
          variables: {
            timestamp: startTime,
            exchangeAddr: exchangeAddress,
            skip: skipCount
          },
          fetchOptions: {
            signal: ab.signal
          },
          fetchPolicy: 'network-only'
        })
        if (result) {
          skipCount = skipCount + 100
          if (
            result.data.transactions.length === 0 ||
            result.data.transactions[result.data.transactions.length - 1].timestamp < startTime
          ) {
            fetchingData = false
          }
          data = data.concat(result.data.transactions)
        }
      }

      let ts = []
      let newSwaps = []
      let newAdds = []
      let newRemoves = []
      Object.keys(data).map((item, i) => {
        if (data[item].timestamp > startTime) {
          if (data[item].addLiquidityEvents.length > 0) {
            let entry
            let newItem = {
              tx: data[item].id,
              ethAmount: '',
              tokenAmount: '',
              user: data[item].user,
              timestamp: data[item].timestamp
            }
            for (entry in data[item].addLiquidityEvents) {
              newItem.ethAmount = data[item].addLiquidityEvents[entry].ethAmount
              newItem.tokenAmount = data[item].addLiquidityEvents[entry].tokenAmount
              newItem.event = 'AddLiquidity'
              newAdds.push(newItem)
              ts.push(newItem)
            }
          }
          if (data[item].removeLiquidityEvents.length > 0) {
            let entry
            let newItem = {
              tx: data[item].id,
              ethAmount: '',
              tokenAmount: '',
              user: data[item].user,
              timestamp: data[item].timestamp
            }
            for (entry in data[item].removeLiquidityEvents) {
              newItem.ethAmount = data[item].removeLiquidityEvents[entry].ethAmount
              newItem.tokenAmount = data[item].removeLiquidityEvents[entry].tokenAmount
              newItem.event = 'RemoveLiquidity'
              newRemoves.push(newItem)
              ts.push(newItem)
            }
          }
          if (data[item].tokenPurchaseEvents.length > 0) {
            let entry
            let newItem = {
              tx: data[item].id,
              ethAmount: '',
              tokenAmount: '',
              user: data[item].user,
              timestamp: data[item].timestamp
            }
            for (entry in data[item].tokenPurchaseEvents) {
              newItem.ethAmount = data[item].tokenPurchaseEvents[entry].eth
              newItem.tokenAmount = data[item].tokenPurchaseEvents[entry].token
              newItem.event = 'TokenPurchase'
              newSwaps.push(newItem)
              ts.push(newItem)
            }
          }
          if (data[item].ethPurchaseEvents.length > 0) {
            let entry
            let newItem = {
              tx: data[item].id,
              ethAmount: '',
              tokenAmount: '',
              user: data[item].user,
              timestamp: data[item].timestamp
            }
            for (entry in data[item].ethPurchaseEvents) {
              newItem.ethAmount = data[item].ethPurchaseEvents[entry].eth
              newItem.tokenAmount = data[item].ethPurchaseEvents[entry].token
              newItem.event = 'EthPurchase'
              newSwaps.push(newItem)
              ts.push(newItem)
            }
          }
        }
        return true
      })
      setTxs(ts)
      SetFilteredTxs(ts)
      SetSwaps(newSwaps)
      SetAdds(newAdds)
      SetRemoves(newRemoves)
      setLoading(false)
      // setTxCount(ts.length)
      setMaxPage(Math.floor(ts.length / TXS_PER_PAGE) + 1)
    }
    getTxs()

    // cleanup graphql call
    return function cleanup() {
      ab.abort()
    }
  }, [exchangeAddress])

  function getTransactionType(event, symbol) {
    switch (event) {
      case 'AddLiquidity':
        return 'Add ETH and ' + symbol
      case 'RemoveLiquidity':
        return 'Remove ETH and ' + symbol
      case 'Token Swap':
        return 'Swap ' + symbol + ' for ETH'
      case 'EthPurchase':
        return 'Swap ' + symbol + ' for ETH'
      case 'TokenPurchase':
        return 'Swap ETH for ' + symbol

      default:
        return ''
    }
  }

  const belowMedium = useMedia('(max-width: 64em)')

  const belowSmall = useMedia('(max-width: 40em)')

  const TransactionItem = ({ transaction, tokenSymbol }) => {
    return (
      <DashGrid style={{ height: '60px' }}>
        <DataText area={'action'} color="text" fontWeight="500">
          <CustomLink ml="3" color="button" external href={urls.showTransaction(transaction.tx)}>
            {getTransactionType(transaction.event, tokenSymbol)}
          </CustomLink>
        </DataText>
        <DataText area={'value'}>
          {price && priceUSD ? '$' + formattedNum(Big(transaction.ethAmount) * price * priceUSD, true) : ''}
        </DataText>
        {!belowMedium ? (
          <>
            <DataText area={'ethAmount'}>{formattedNum(Big(transaction.ethAmount))}</DataText>
            <DataText area={'tokenAmount'}>{formattedNum(Big(transaction.tokenAmount))}</DataText>
          </>
        ) : (
          ''
        )}
        {!belowSmall ? (
          <DataText area={'Account'}>
            <Link ml="3" color="button" external href={'https://etherscan.io/address/' + transaction.user}>
              {transaction.user.slice(0, 6) + '...' + transaction.user.slice(38, 42)}
            </Link>
          </DataText>
        ) : (
          ''
        )}
        <DataText area={'Time'}>{formatTime(transaction.timestamp)}</DataText>
      </DashGrid>
    )
  }

  return (
    <ListWrapper>
      <DashGrid center={true} style={{ height: '60px' }}>
        <Flex alignItems="center">
          <Text color="text" area={'action'}>
            Transactions (24h)
          </Text>
        </Flex>
        <Flex alignItems="center">
          <ClickableText
            area={'value'}
            color="textDim"
            onClick={e => {
              setSortedColumn(SORT_FIELD.USD_VALUE)
              setSortDirection(!sortDirection)
              sortTxs(SORT_FIELD.USD_VALUE)
            }}
          >
            Value {sortedColumn === SORT_FIELD.USD_VALUE ? (sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
        {!belowMedium ? (
          <>
            <Flex alignItems="center">
              <ClickableText
                area={'ethAmount'}
                color="textDim"
                onClick={e => {
                  setSortedColumn(SORT_FIELD.ETH_VALUE)
                  setSortDirection(!sortDirection)
                  sortTxs(SORT_FIELD.ETH_VALUE)
                }}
              >
                ETH Amount {sortedColumn === SORT_FIELD.ETH_VALUE ? (sortDirection ? '↑' : '↓') : ''}
              </ClickableText>
            </Flex>
            <Flex alignItems="center">
              <ClickableText
                area={'tokenAmount'}
                color="textDim"
                onClick={e => {
                  setSortedColumn(SORT_FIELD.TOKEN_VALUE)
                  setSortDirection(!sortDirection)
                  sortTxs(SORT_FIELD.TOKEN_VALUE)
                }}
              >
                Token Amount {sortedColumn === SORT_FIELD.TOKEN_VALUE ? (sortDirection ? '↑' : '↓') : ''}
              </ClickableText>
            </Flex>
          </>
        ) : (
          ''
        )}
        {!belowSmall ? (
          <Flex alignItems="center">
            <Text area={'Account'} color="textDim">
              Account
            </Text>
          </Flex>
        ) : (
          ''
        )}
        <Flex alignItems="center">
          <ClickableText
            area={'time'}
            color="textDim"
            onClick={e => {
              setSortedColumn(SORT_FIELD.TIME)
              setSortDirection(!sortDirection)
              sortTxs(SORT_FIELD.TIME)
            }}
          >
            Time {sortedColumn === SORT_FIELD.TIME ? (sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
      </DashGrid>
      <Divider />
      <List p={0}>
        {!loading && txs && filteredTxs.length === 0 ? <EmptyTxWrapper>No transactions</EmptyTxWrapper> : ''}
        {loading ? (
          <LocalLoader />
        ) : (
          filteredTxs.slice(TXS_PER_PAGE * (page - 1), page * TXS_PER_PAGE).map((tx, index) => {
            return (
              <div key={index}>
                <TransactionItem key={index} transaction={tx} tokenSymbol={tokenSymbol} />
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
        {'Page ' + page + ' of ' + maxPage}
        <div
          onClick={e => {
            setPage(page === maxPage ? page : page + 1)
          }}
        >
          <Arrow faded={page === maxPage ? true : false}>→</Arrow>
        </div>
      </PageButtons>
    </ListWrapper>
  )
}

TransactionsList.defaultProps = {
  transactions: []
}

TransactionsList.propTypes = {
  transactions: PropTypes.array.isRequired
}

export default TransactionsList
