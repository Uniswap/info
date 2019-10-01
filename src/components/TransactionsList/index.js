import React, { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { client } from '../../apollo/client'
import { TRANSACTIONS_QUERY_SKIPPABLE } from '../../apollo/queries'
import { Box, Flex, Text } from 'rebass'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import Link from '../Link'
import { Divider } from '../../components'
import Loader from '../../components/Loader'

import { urls, formatTime, Big } from '../../helpers'

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
  display: flex;

  > * {
    justify-content: flex-end;

    &:first-child {
      justify-content: flex-start;
    }
  }

  @media screen and (min-width: 64em) {
    max-width: 1280px;
    display: grid;
    grid-gap: 1em;
    grid-template-columns: 1.2fr 1fr 1fr 1fr 1fr 1fr;
    grid-template-areas: 'action value ethAmount tokenAmount Account Time';
  }
`

const ListWrapper = styled.div`
  padding: 0 1em;
`

const CustomLink = styled(Link)`
  margin-left: 0px;
`

const ClickableText = styled(Text)`
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

const DesktopOnly = styled(Flex)`
  @media screen and (max-width: 44em) {
    display: none;
  }
`

const SORT_FIELD = {
  TIME: 'timestamp',
  USD_VALUE: 'usdAmount',
  ETH_VALUE: 'ethAmount',
  TOKEN_VALUE: 'tokenAmount'
}

// @TODO rework into virtualized list
function TransactionsList({ tokenSymbol, exchangeAddress, price, priceUSD, setTxCount, txFilter, accountInput }) {
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

  function formattedNum(num, decimals) {
    let number = Number(parseFloat(num).toFixed(decimals)).toLocaleString()
    if (number < 0.0001) {
      return '< 0.0001'
    }
    return number
  }

  function formattedNumUsd(num, decimals) {
    let number = Number(parseFloat(num).toFixed(decimals)).toLocaleString()
    if (number < 0.0001) {
      return ' < $0.0001'
    }
    return '$' + number
  }

  useEffect(() => {
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
      setMaxPage(Math.floor(foundAccounts.length / TXS_PER_PAGE) + 1)
    } else {
      SetFilteredTxs(txs)
      setMaxPage(Math.floor(txs.length / TXS_PER_PAGE) + 1)
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
  }

  useEffect(() => {
    setSortDirection(true)
    switch (txFilter) {
      case 'Add':
        SetFilteredTxs(adds)
        setMaxPage(Math.floor(adds.length / TXS_PER_PAGE) + 1)
        break
      case 'Remove':
        SetFilteredTxs(removes)
        setMaxPage(Math.floor(removes.length / TXS_PER_PAGE) + 1)
        break
      case 'Swaps':
        SetFilteredTxs(swaps)
        setMaxPage(Math.floor(swaps.length / TXS_PER_PAGE) + 1)
        break
      default:
        SetFilteredTxs(txs)
        setMaxPage(Math.floor(txs.length / TXS_PER_PAGE) + 1)
        break
    }
  }, [txFilter, adds, removes, swaps, txs])

  // get the data
  useEffect(() => {
    setPage(1)
    async function getTxs() {
      setLoading(true)

      // current time
      const utcEndTime = dayjs.utc()
      let utcStartTime
      utcStartTime = utcEndTime.subtract(1, 'day').startOf('day')
      let startTime = utcStartTime.unix() - 1 // -1 because we filter on greater than in the query
      let data = []
      let skipCount = 0
      let validDataLength = 0
      let fetchingData = true

      while (fetchingData) {
        let result = await client.query({
          query: TRANSACTIONS_QUERY_SKIPPABLE,
          variables: {
            exchangeAddr: exchangeAddress,
            skip: skipCount
          },
          fetchPolicy: 'network-only'
        })
        if (result) {
          skipCount = skipCount + 100
          if (result.data.transactions.length === 0) {
            fetchingData = false
            setLoading(false)
          } else if (result.data.transactions[result.data.transactions.length - 1].timestamp < startTime) {
            fetchingData = false
            setLoading(false)
          }
          data = data.concat(result.data.transactions)
        }
      }

      let ts = []
      let newSwaps = []
      let newAdds = []
      let newRemoves = []
      // eslint-disable-next-line array-callback-return
      Object.keys(data).map((item, i) => {
        if (data[item].timestamp > startTime) {
          ts.push(data[item])
          validDataLength++
          if (data[item].event === 'AddLiquidity') {
            newAdds.push(data[item])
          } else if (data[item].event === 'RemoveLiquidity') {
            newRemoves.push(data[item])
          } else {
            newSwaps.push(data[item])
          }
        }
      })
      setTxs(ts)
      SetFilteredTxs(ts)
      SetSwaps(newSwaps)
      SetAdds(newAdds)
      SetRemoves(newRemoves)
      setTxCount(ts.length)
      setMaxPage(Math.floor(validDataLength / TXS_PER_PAGE) + 1)
    }
    getTxs()
  }, [exchangeAddress, setTxCount])

  function getTransactionType(event, symbol) {
    switch (event) {
      case 'AddLiquidity':
        return 'Add ETH and ' + symbol
      case 'RemoveLiquidity':
        return 'Remove ETH and ' + symbol
      case 'Token Swap':
        return 'Swap ETH for ' + symbol
      case 'EthPurchase':
        return 'Swap ETH for ' + symbol
      case 'TokenPurchase':
        return 'Swap ' + symbol + ' for ETH'
      default:
        return ''
    }
  }

  const TransactionItem = ({ transaction, tokenSymbol }) => {
    return (
      <DashGrid>
        <Flex p={24} alignItems={'center'}>
          <Text color="text" area={'action'} fontWeight="500">
            <CustomLink ml="3" color="button" external href={urls.showTransaction(transaction.tx)}>
              {getTransactionType(transaction.event, tokenSymbol)}
            </CustomLink>
          </Text>
        </Flex>
        <Flex p={24}>
          <Text area={'value'}>
            {price && priceUSD ? formattedNumUsd(Big(transaction.ethAmount).toFixed(4) * price * priceUSD, 2) : ''}
          </Text>
        </Flex>
        <DesktopOnly p={24}>
          <Text area={'ethAmount'}>{formattedNum(Big(transaction.ethAmount), 4)}</Text>
        </DesktopOnly>
        <DesktopOnly p={24}>
          <Text area={'tokenAmount'}>{formattedNum(Big(transaction.tokenAmount), 4)}</Text>
        </DesktopOnly>
        <DesktopOnly p={24}>
          <Link
            fontSize={[12, 16]}
            ml="3"
            color="button"
            external
            href={'https://etherscan.io/address/' + transaction.user}
          >
            <Text area={'Account'}>{transaction.user.slice(0, 6) + '...' + transaction.user.slice(38, 42)}</Text>
          </Link>
        </DesktopOnly>
        <Flex p={24}>
          <Text fontSize={[12, 16]} area={'Time'}>
            {formatTime(transaction.timestamp)}
          </Text>
        </Flex>
      </DashGrid>
    )
  }

  return (
    <ListWrapper>
      <DashGrid center={true}>
        <Flex p={24}>
          <Text color="text" area={'action'}>
            Transactions (24h)
          </Text>
        </Flex>
        <Flex p={24}>
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
        <DesktopOnly p={24}>
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
        </DesktopOnly>
        <DesktopOnly p={24}>
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
        </DesktopOnly>
        <DesktopOnly p={24}>
          <Text area={'Account'} color="textDim">
            Account
          </Text>
        </DesktopOnly>
        <Flex p={24}>
          <ClickableText
            area={'time'}
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
        {loading && txs ? (
          <Loader />
        ) : (
          filteredTxs.slice(TXS_PER_PAGE * (page - 1), page * TXS_PER_PAGE - 1).map((tx, index) => {
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
        <i data-feather="circle"></i>
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
