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
    grid-gap: 1em;
    grid-template-columns: 1fr 0.8fr 0.8fr 1fr 1fr 1fr;
    grid-template-areas: 'name symbol price txs liquidity volume';
  }
`

const DashGridClickable = styled(DashGrid)`
  :hover {
    background-color: #f8f8f8;
    cursor: pointer;
  }
`

const ListWrapper = styled.div`
  padding: 0 1em;
`

const ClickableText = styled(Text)`
  text-align: right;

  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

const DataText = styled(Flex)`
  @media screen and (max-width: 40em) {
    font-size: 14px;
  }

  @media screen and (max-width: 64em) {
    padding: 0px;
  }

  padding: 18px;
  align-items: center;
  text-align: right;

  & > * {
    font-size: 1em;
  }
`

const LogoBox = styled.div`
  width: 30px;
  padding-left: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20px;

  @media screen and (max-width: 40em) {
    margin-right: 6px;
  }
`

const LogoTextWrapper = styled(Flex)`
  align-items: center;
  padding: 18px;

  @media screen and (max-width: 64em) {
    padding: 12px;
  }

  @media screen and (max-width: 40em) {
    padding: 12px 0px;
  }
`

// @TODO rework into virtualized list
function OverviewList({
  tokenSymbol,
  switchActiveExchange,
  exchangeAddress,
  price,
  priceUSD,
  setTxCount,
  txFilter,
  accountInput
}) {
  const [txs, setTxs] = useState([])

  const [filteredTxs, SetFilteredTxs] = useState([])

  const [volumeMap, setVolumeMap] = useState({})

  const [page, setPage] = useState(1)

  const [maxPage, setMaxPage] = useState(1)

  const TXS_PER_PAGE = 20

  const [loading, setLoading] = useState(true)

  const [sortDirection, setSortDirection] = useState(true)

  const history = useHistory()

  function formattedNum(num, usd = false) {
    if (num === 0) {
      return 0
    }
    if (num < 0.0001) {
      return '< 0.0001'
    }
    if (usd && num >= 0.01) {
      return Number(parseFloat(num).toFixed(2)).toLocaleString()
    }
    return Number(parseFloat(num).toFixed(4)).toLocaleString()
  }

  const SORT_FIELD = {
    PRICE: 'priceUSD',
    LIQUIDITY: 'ethBalance',
    TRANSACTIIONS: 'totalTxsCount',
    VOLUME: 'volume'
  }

  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.LIQUIDITY)

  function sortTxs(field) {
    if (field === SORT_FIELD.VOLUME) {
      let newTxs = filteredTxs.slice().sort((a, b) => {
        if (volumeMap.hasOwnProperty(a.id) && volumeMap.hasOwnProperty(b.id)) {
          return parseFloat(volumeMap[a.id].volume) > parseFloat(volumeMap[b.id].volume)
            ? (sortDirection ? -1 : 1) * 1
            : (sortDirection ? -1 : 1) * -1
        } else {
          return 1
        }
      })
      SetFilteredTxs(newTxs)
    } else {
      let newTxs = filteredTxs.slice().sort((a, b) => {
        return parseFloat(a[field]) > parseFloat(b[field])
          ? (sortDirection ? -1 : 1) * -1
          : (sortDirection ? -1 : 1) * 1
      })
      SetFilteredTxs(newTxs)
    }
  }

  useEffect(() => {
    setSortDirection(true)
  }, [txs])

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
          setMaxPage(Math.floor(result.data.exchanges.length / TXS_PER_PAGE))
          SetFilteredTxs(result.data.exchanges)
          setTxs(result.data.exchanges)
        }
      }
    }
    getTxs()
  }, [])

  useEffect(() => {
    function get24HrVol() {
      let promises = []
      let ldata = {}
      txs.map(item => {
        try {
          ldata[item.id] = item
          // const utcCurrentTime = dayjs()
          const utcCurrentTime = dayjs('2019-06-25')
          const utcOneDayBack = utcCurrentTime.subtract(1, 'day')
          const result24HoursAgo = client.query({
            query: TICKER_24HOUR_QUERY,
            variables: {
              exchangeAddr: item.id,
              timestamp: utcOneDayBack.unix()
            },
            fetchPolicy: 'network-only'
          })
          promises.push(result24HoursAgo)
        } catch (err) {
          console.log('error: ', err)
        }
      })

      Promise.all(promises).then(resolved => {
        let newVolumeMap = {}
        resolved.map(oldItem => {
          let data24HoursAgo = oldItem.data.exchangeHistoricalDatas[0]

          if (data24HoursAgo) {
            // get the volume difference
            let oneDayVolume = ldata[data24HoursAgo.exchangeAddress].tradeVolumeEth - data24HoursAgo.tradeVolumeEth

            newVolumeMap[ldata[data24HoursAgo.exchangeAddress].id] = {}
            newVolumeMap[ldata[data24HoursAgo.exchangeAddress].id].volume = oneDayVolume

            let oneDayTxs = ldata[data24HoursAgo.exchangeAddress].totalTxsCount - data24HoursAgo.totalTxsCount
            newVolumeMap[ldata[data24HoursAgo.exchangeAddress].id].txs = oneDayTxs
          }
        })

        setVolumeMap(newVolumeMap)
      })
    }
    get24HrVol()
  }, [txs])

  const belowMedium = useMedia('(max-width: 64em)')

  const belowSmall = useMedia('(max-width: 40em)')

  const TransactionItem = ({ exchange }) => {
    return (
      <DashGridClickable
        onClick={() => {
          switchActiveExchange(exchange.id)
          history.push('/tokens')
          window.scrollTo(0, 0)
        }}
      >
        <LogoTextWrapper>
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
        </LogoTextWrapper>
        {!belowMedium ? (
          <>
            <DataText area={'symbol'}>{exchange.tokenSymbol}</DataText>
            <DataText area={'price'}>${formattedNum(exchange.priceUSD, true)}</DataText>
          </>
        ) : (
          ''
        )}
        <DataText area={'liquidity'}>{formattedNum(exchange.ethBalance)} ETH</DataText>
        {!belowSmall ? (
          <DataText area={'txs'}>
            {volumeMap.hasOwnProperty(exchange.id) ? formattedNum(volumeMap[exchange.id].txs) : '-'}
          </DataText>
        ) : (
          ''
        )}
        <DataText area={'volume'}>
          {volumeMap.hasOwnProperty(exchange.id) ? formattedNum(volumeMap[exchange.id].volume) + ' ETH' : '-'}
        </DataText>
      </DashGridClickable>
    )
  }

  return (
    <ListWrapper>
      <DashGrid center={true}>
        <Flex p={24} alignItems="center">
          <Text color="text" area={'name'}>
            Exchanges
          </Text>
        </Flex>
        {!belowMedium ? (
          <>
            <Flex p={belowMedium ? 12 : 24} alignItems="center">
              <Text>Symbol</Text>
            </Flex>
            <Flex p={belowMedium ? 12 : 24} alignItems="center">
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
        <Flex p={belowMedium ? 12 : 24} alignItems="center">
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
        {!belowSmall ? (
          <Flex p={belowMedium ? 12 : 0} alignItems="center">
            <ClickableText
              area={'liquidity'}
              color="textDim"
              onClick={e => {
                setSortedColumn(SORT_FIELD.TRANSACTIIONS)
                setSortDirection(!sortDirection)
                sortTxs(SORT_FIELD.TRANSACTIIONS)
              }}
            >
              Transactions (24hrs){sortedColumn === SORT_FIELD.TRANSACTIIONS ? (sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        ) : (
          ''
        )}
        <Flex p={belowMedium ? 12 : 24} alignItems="center">
          <ClickableText
            area={'liquidity'}
            color="textDim"
            onClick={e => {
              setSortedColumn(SORT_FIELD.VOLUME)
              setSortDirection(!sortDirection)
              sortTxs(SORT_FIELD.VOLUME)
            }}
          >
            Volume (24hrs){sortedColumn === SORT_FIELD.VOLUME ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
      </DashGrid>

      <Divider />
      <List p={0}>
        {loading && txs.length === 0 ? (
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
