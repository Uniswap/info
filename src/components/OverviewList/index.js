import React, { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { client } from '../../apollo/client'
import { OVERVIEW_PAGE_QUERY, TICKER_24HOUR_QUERY } from '../../apollo/queries'
import { Box, Flex, Text } from 'rebass'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import TokenLogo from '../TokenLogo'

import { Divider } from '../../components'
import Loader from '../../components/Loader'

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
    grid-template-columns: 1.6fr 1fr 1fr 1fr 0.6fr 1fr;
    grid-template-areas: 'name symbol price liquidity txs volume';
  }
`

const ListWrapper = styled.div`
  padding: 0 1em;
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

const LogoBox = styled.div`
  width: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
`

const SORT_FIELD = {
  PRICE: 'priceUSD',
  LIQUIDITY: 'ethBalance',
  TRANSACTIIONS: 'transactions',
  VOLUME: 'oneDayVolume'
}

// @TODO rework into virtualized list
function OverviewList({ tokenSymbol, exchangeAddress, price, priceUSD, setTxCount, txFilter, accountInput }) {
  const [txs, setTxs] = useState([])

  const [volumeMap, setVolumeMap] = useState([])

  const [filteredTxs, SetFilteredTxs] = useState([])

  const [page, setPage] = useState(1)

  const [maxPage, setMaxPage] = useState(1)

  const TXS_PER_PAGE = 20

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

  function sortTxs(field) {
    let newTxs = filteredTxs
      .slice()
      .sort((a, b) =>
        parseFloat(a[field]) > parseFloat(b[field]) ? (sortDirection ? -1 : 1) * -1 : (sortDirection ? -1 : 1) * 1
      )
    SetFilteredTxs(newTxs)
  }

  useEffect(() => {
    setSortDirection(true)
  }, [txFilter, txs])

  // get the data
  useEffect(() => {
    setPage(1)
    async function getTxs() {
      setLoading(true)
      let fetchingData = true
      while (fetchingData) {
        let result = await client.query({
          query: OVERVIEW_PAGE_QUERY,
          fetchPolicy: 'network-only'
        })
        if (result) {
          setLoading(false)
          fetchingData = false
          setMaxPage(Math.floor(result.data.exchanges.length / TXS_PER_PAGE) + 1)
          SetFilteredTxs(result.data.exchanges)
          setTxs(result.data.exchanges)
        }
      }
    }
    getTxs()
  }, [])

  useEffect(() => {
    async function get24HrVol() {
      let newMap = []
      txs.map(async item => {
        let data24HoursAgo
        try {
          const utcCurrentTime = dayjs()
          const utcOneDayBack = utcCurrentTime.subtract(1, 'day')
          const result24HoursAgo = await client.query({
            query: TICKER_24HOUR_QUERY,
            variables: {
              exchangeAddr: item.id,
              timestamp: utcOneDayBack.unix()
            },
            fetchPolicy: 'network-only'
          })
          if (result24HoursAgo) {
            data24HoursAgo = result24HoursAgo.data.exchangeHistoricalDatas[0]
          }
        } catch (err) {
          console.log('error: ', err)
        }

        let volumePercentChange = ''
        const adjustedVolumeChangePercent = (
          ((item.tradeVolumeEth - data24HoursAgo.tradeVolumeEth) / item.tradeVolumeEth) *
          100
        ).toFixed(2)
        adjustedVolumeChangePercent > 0 ? (volumePercentChange = '+') : (volumePercentChange = '')
        volumePercentChange += adjustedVolumeChangePercent

        let oneDayVolume = item.tradeVolumeEth - data24HoursAgo.tradeVolumeEth
        newMap[item.id] = oneDayVolume
      })
      setVolumeMap(newMap)
    }
    get24HrVol()
  }, [txs])

  const TransactionItem = ({ exchange }) => {
    return (
      //name symbol price liquidity txs volume
      <DashGrid>
        <Flex p={24} alignItems={'center'}>
          <LogoBox>
            <TokenLogo
              size={24}
              address={exchange.tokenAddress}
              style={{ height: '24px', width: '24px', marginRight: '20px' }}
            />
          </LogoBox>
          <Text color="text" area={'name'} fontWeight="500">
            {exchange.tokenName}
          </Text>
        </Flex>
        <Flex p={24}>
          <Text area={'symbol'}>{exchange.tokenSymbol}</Text>
        </Flex>
        <DesktopOnly p={24}>
          <Text area={'price'}>{formattedNumUsd(exchange.priceUSD, 2)}</Text>
        </DesktopOnly>
        <DesktopOnly p={24}>
          <Text area={'liquidity'}>{formattedNum(exchange.ethBalance, 4)} ETH</Text>
        </DesktopOnly>
        <DesktopOnly p={24}>
          <Text area={'txs'}>98</Text>
        </DesktopOnly>
        <Flex p={24}>
          <Text fontSize={[12, 16]} area={'volume'}>
            {volumeMap.hasOwnProperty(exchange.id) ? formattedNum(volumeMap[exchange.id], 4) + ' ETH' : '-'}
          </Text>
        </Flex>
      </DashGrid>
    )
  }

  return (
    <ListWrapper>
      <DashGrid center={true}>
        <Flex p={24}>
          <Text color="text" area={'name'}>
            Exchanges
          </Text>
        </Flex>
        <Flex p={24}>
          <Text>Symbol</Text>
        </Flex>
        <DesktopOnly p={24}>
          <ClickableText
            area={'price'}
            color="textDim"
            onClick={e => {
              setSortedColumn(SORT_FIELD.PRICE)
              setSortDirection(!sortDirection)
              sortTxs(SORT_FIELD.PRICE)
            }}
          >
            Price {sortedColumn === SORT_FIELD.PRICE ? (sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </DesktopOnly>
        <DesktopOnly p={24}>
          <ClickableText
            area={'liquidity'}
            color="textDim"
            onClick={e => {
              setSortedColumn(SORT_FIELD.LIQUIDITY)
              setSortDirection(!sortDirection)
              sortTxs(SORT_FIELD.LIQUIDITY)
            }}
          >
            Liquidity {sortedColumn === SORT_FIELD.LIQUIDITY ? (sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </DesktopOnly>
        <DesktopOnly p={24}>
          <ClickableText
            area={'liquidity'}
            color="textDim"
            onClick={e => {
              setSortedColumn(SORT_FIELD.TRANSACTIIONS)
              setSortDirection(!sortDirection)
              sortTxs(SORT_FIELD.TRANSACTIIONS)
            }}
          >
            Transactions {sortedColumn === SORT_FIELD.TRANSACTIIONS ? (sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </DesktopOnly>
        <DesktopOnly p={24}>
          <ClickableText
            area={'liquidity'}
            color="textDim"
            onClick={e => {
              setSortedColumn(SORT_FIELD.VOLUME)
              setSortDirection(!sortDirection)
              sortTxs(SORT_FIELD.VOLUME)
            }}
          >
            24hr Volume {sortedColumn === SORT_FIELD.VOLUME ? (sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </DesktopOnly>
      </DashGrid>
      <Divider />
      <List p={0}>
        {loading && txs ? (
          <Loader />
        ) : (
          filteredTxs.slice(TXS_PER_PAGE * (page - 1), page * TXS_PER_PAGE - 1).map((item, index) => {
            return (
              <div key={index}>
                <TransactionItem key={index} exchange={item} />
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

OverviewList.defaultProps = {
  transactions: []
}

OverviewList.propTypes = {
  transactions: PropTypes.array.isRequired
}

export default OverviewList
