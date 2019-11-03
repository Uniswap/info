import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { useMedia } from 'react-use'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { client } from '../../apollo/client'
import { OVERVIEW_PAGE_QUERY, TICKER_24HOUR_QUERY } from '../../apollo/queries'
import { Box, Flex, Text } from 'rebass'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import TokenLogo from '../TokenLogo'
import { formattedNum } from '../../helpers'
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
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-areas: 'symbol liquidity volume';
  padding: 0 6px;

  > * {
    justify-content: flex-end;
    width: 100%;

    &:first-child {
      justify-content: flex-start;
      width: 100px;
    }
  }

  @media screen and (min-width: 40em) {
    max-width: 1280px;
    display: grid;
    grid-gap: 1em;
    grid-template-columns: 0.8fr 1fr 1fr 1fr;
    grid-template-areas: 'name txs liquidity volume';

    > * {
      justify-content: flex-end;
      width: 100%;

      &:first-child {
        justify-content: flex-start;
        width: 240px;
      }
    }
  }

  @media screen and (min-width: 64em) {
    max-width: 1280px;
    display: grid;
    padding: 0 24px;
    grid-gap: 1em;
    grid-template-columns: 1fr 0.8fr 0.8fr 1fr 1fr 1fr;
    grid-template-areas: 'name symbol price volume liquidity txs';
  }
`

const DashGridClickable = styled(DashGrid)`
  :hover {
    background-color: #f8f8f8;
    cursor: pointer;
  }
`

const ListWrapper = styled.div`
  @media screen and (max-width: 40em) {
    padding: 0 0.4em;
  }
`

const ClickableText = styled(Text)`
  text-align: right;

  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }

  user-select: none;
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

const LogoBox = styled.div`
  width: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 4px;

  @media screen and (max-width: 40em) {
    margin-right: 6px;
  }
`

// @TODO rework into virtualized list
function OverviewList({ currencyUnit }) {
  const [exchanges, setExchanges] = useState([])

  const [filteredTxs, SetFilteredTxs] = useState([])

  const [exchangeData24Hour, setExchangeData24Hour] = useState({})

  const [page, setPage] = useState(1)

  const [maxPage, setMaxPage] = useState(1)

  const TXS_PER_PAGE = 10

  const [loading, setLoading] = useState(true)

  const [sortDirection, setSortDirection] = useState(true)

  const history = useHistory()

  const SORT_FIELD = {
    PRICE: 'priceUSD',
    LIQUIDITY: 'ethBalance',
    TRANSACTIIONS: 'txs',
    VOLUME: 'volume',
    SYMBOL: 'tokenSymbol',
    PRICE_CHANGE: 'priceChange'
  }

  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.LIQUIDITY)

  function getPercentChangeColor(change) {
    if (change === 0) {
      return <span>{change + ' %'}</span>
    }
    if (change < 0) {
      return <span style={{ color: 'red' }}>{change + ' %'}</span>
    }
    return <span style={{ color: 'green' }}>{change + ' %'}</span>
  }

  function sortTxs(field) {
    if (field === SORT_FIELD.VOLUME || field === SORT_FIELD.TRANSACTIIONS || field === SORT_FIELD.PRICE_CHANGE) {
      let newTxs = filteredTxs.slice().sort((a, b) => {
        if (!exchangeData24Hour.hasOwnProperty(a.id)) {
          exchangeData24Hour[a.id] = {}
          exchangeData24Hour[a.id].volume = 0
          exchangeData24Hour[a.id].txs = 0
          exchangeData24Hour[a.id].priceChange = 0
          setExchangeData24Hour(exchangeData24Hour)
        }
        if (!exchangeData24Hour.hasOwnProperty(b.id)) {
          exchangeData24Hour[b.id] = {}
          exchangeData24Hour[b.id].volume = 0
          exchangeData24Hour[a.id].txs = 0
          exchangeData24Hour[b.id].priceChange = 0
          setExchangeData24Hour(exchangeData24Hour)
        }
        return parseFloat(exchangeData24Hour[a.id][field]) > parseFloat(exchangeData24Hour[b.id][field])
          ? (sortDirection ? -1 : 1) * 1
          : (sortDirection ? -1 : 1) * -1
      })
      SetFilteredTxs(newTxs)
      setPage(1)
    } else {
      let newTxs
      if (field === SORT_FIELD.SYMBOL) {
        newTxs = filteredTxs.slice().sort((a, b) => {
          return a[field].toString().toLowerCase() > b[field].toString().toLowerCase()
            ? (sortDirection ? -1 : 1) * -1
            : (sortDirection ? -1 : 1) * 1
        })
      } else {
        newTxs = filteredTxs.slice().sort((a, b) => {
          return parseFloat(a[field]) > parseFloat(b[field])
            ? (sortDirection ? -1 : 1) * -1
            : (sortDirection ? -1 : 1) * 1
        })
      }
      SetFilteredTxs(newTxs)
      setPage(1)
    }
  }

  useEffect(() => {
    setSortDirection(true)
  }, [exchanges])

  // get top 100 exchanges by liquidity
  useEffect(() => {
    setPage(1)

    async function getTxs() {
      setLoading(true)
      let result = await client.query({
        query: OVERVIEW_PAGE_QUERY,
        fetchPolicy: 'cache-first'
      })
      if (result) {
        setMaxPage(Math.floor(result.data.exchanges.length / TXS_PER_PAGE))
        SetFilteredTxs(result.data.exchanges)
        setExchanges(result.data.exchanges)
      }
    }
    getTxs()
  }, [])

  useEffect(() => {
    function get24HrVol() {
      let promises = []
      let currentData = {}
      exchanges.map(item => {
        try {
          currentData[item.id] = item
          const utcCurrentTime = dayjs()
          const utcOneDayBack = utcCurrentTime.subtract(1, 'day')
          let result24HoursAgo
          result24HoursAgo = client.query({
            query: TICKER_24HOUR_QUERY,
            variables: {
              exchangeAddr: item.id,
              timestamp: utcOneDayBack.unix()
            },
            fetchPolicy: 'cache-first'
          })
          promises.push(result24HoursAgo)

          return true
        } catch (err) {
          console.log('error: ', err)
          return false
        }
      })

      Promise.all(promises).then(resolved => {
        let new24HourData = {}
        resolved.map(oldItem => {
          // get first result less than 24 hours ago
          let data24HoursAgo = oldItem.data.exchangeHistoricalDatas[0]

          if (data24HoursAgo) {
            const exchangeID = data24HoursAgo.exchangeAddress

            new24HourData[exchangeID] = {}

            //set the price data
            new24HourData[exchangeID].price = currentData[exchangeID].price
            new24HourData[exchangeID].priceUSD = currentData[exchangeID].priceUSD

            // get the volume difference
            let oneDayVolume = currentData[exchangeID].tradeVolumeEth - data24HoursAgo.tradeVolumeEth
            new24HourData[exchangeID].volume = oneDayVolume

            // get the tx difference
            let oneDayTxs = currentData[exchangeID].totalTxsCount - data24HoursAgo.totalTxsCount
            new24HourData[exchangeID].txs = oneDayTxs

            const priceChangeRaw = (
              ((currentData[exchangeID].priceUSD - data24HoursAgo.tokenPriceUSD) / currentData[exchangeID].priceUSD) *
              100
            ).toFixed(2)
            new24HourData[exchangeID].priceChange = priceChangeRaw
          }
          return true
        })
        setLoading(false)
        setExchangeData24Hour(new24HourData)
      })
    }
    get24HrVol()
  }, [exchanges])

  const belowMedium = useMedia('(max-width: 64em)')

  const belowSmall = useMedia('(max-width: 40em)')

  const TransactionItem = ({ exchange, id }) => {
    return (
      <DashGridClickable
        onClick={() => {
          history.push('/token/' + exchange.id)
          window.scrollTo(0, 0)
        }}
        style={{ height: '60px' }}
      >
        <Flex alignItems="center" justifyContent="flex-start">
          <div style={{ minWidth: '30px' }}>{id + (page - 1) * 20}</div>
          <LogoBox>
            <TokenLogo size={24} address={exchange.tokenAddress} style={{ height: '24px', width: '24px' }} />
          </LogoBox>
          {!belowSmall ? (
            <Text color="text" area={'name'} fontWeight="500">
              {exchange.tokenName}
            </Text>
          ) : (
            <DataText area={'symbol'}>{exchange.tokenSymbol}</DataText>
          )}
        </Flex>
        {!belowMedium ? (
          <>
            <DataText area={'symbol'}>{exchange.tokenSymbol}</DataText>
            <DataText area={'price'}>
              {exchange.price && exchange.priceUSD
                ? currencyUnit === 'USD'
                  ? '$' + formattedNum(exchange.priceUSD, true)
                  : formattedNum(1 / exchange.price) + ' ETH'
                : ''}
            </DataText>
          </>
        ) : (
          ''
        )}
        <DataText area={'liquidity'}>
          {exchangeData24Hour.hasOwnProperty(exchange.id)
            ? currencyUnit === 'USD'
              ? '$' +
                formattedNum(
                  exchange.ethBalance *
                    2 *
                    exchangeData24Hour[exchange.id].price *
                    exchangeData24Hour[exchange.id].priceUSD,
                  true
                )
              : formattedNum(exchange.ethBalance * 2) + ' ETH'
            : '-'}
        </DataText>

        <DataText area={'volume'}>
          {exchangeData24Hour.hasOwnProperty(exchange.id)
            ? currencyUnit === 'USD'
              ? '$' +
                formattedNum(
                  exchangeData24Hour[exchange.id].volume *
                    exchangeData24Hour[exchange.id].price *
                    exchangeData24Hour[exchange.id].priceUSD,
                  true
                )
              : formattedNum(exchangeData24Hour[exchange.id].volume) + ' ETH'
            : '-'}
        </DataText>
        {!belowSmall ? (
          <DataText area={'txs'}>
            {exchangeData24Hour.hasOwnProperty(exchange.id)
              ? getPercentChangeColor(exchangeData24Hour[exchange.id].priceChange)
              : '-'}
          </DataText>
        ) : (
          ''
        )}
      </DashGridClickable>
    )
  }

  return (
    <ListWrapper>
      <DashGrid center={true} style={{ height: '60px' }}>
        <Flex alignItems="center">
          <Text color="text" area={'name'}>
            Exchanges
          </Text>
        </Flex>
        {!belowMedium ? (
          <>
            <Flex alignItems="center">
              <ClickableText
                area={'liquidity'}
                color="textDim"
                onClick={e => {
                  setSortedColumn(SORT_FIELD.SYMBOL)
                  setSortDirection(!sortDirection)
                  sortTxs(SORT_FIELD.SYMBOL)
                }}
              >
                <Text>Symbol {sortedColumn === SORT_FIELD.SYMBOL ? (sortDirection ? '↑' : '↓') : ''}</Text>
              </ClickableText>
            </Flex>
            <Flex alignItems="center">
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
            </Flex>
          </>
        ) : (
          ''
        )}
        <Flex alignItems="center">
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
        </Flex>
        <Flex alignItems="center">
          <ClickableText
            area={'liquidity'}
            color="textDim"
            onClick={e => {
              setSortedColumn(SORT_FIELD.VOLUME)
              setSortDirection(!sortDirection)
              sortTxs(SORT_FIELD.VOLUME)
            }}
          >
            Volume (24hrs) {sortedColumn === SORT_FIELD.VOLUME ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
        {!belowSmall ? (
          <Flex alignItems="center">
            <ClickableText
              area={'liquidity'}
              color="textDim"
              onClick={e => {
                setSortedColumn(SORT_FIELD.PRICE_CHANGE)
                setSortDirection(!sortDirection)
                sortTxs(SORT_FIELD.PRICE_CHANGE)
              }}
            >
              Price Change (24hrs) {sortedColumn === SORT_FIELD.PRICE_CHANGE ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        ) : (
          ''
        )}
      </DashGrid>

      <Divider />
      <List p={0}>
        {loading || exchanges.length === 0 || exchangeData24Hour.length === 0 ? (
          <Loader />
        ) : (
          filteredTxs.slice(TXS_PER_PAGE * (page - 1), page * TXS_PER_PAGE).map((item, index) => {
            return (
              <div key={index}>
                <TransactionItem key={index} exchange={item} id={index + 1} />
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
