import React from 'react'
import { BigNumber } from 'bignumber.js'
import dayjs from 'dayjs'
import { ethers } from 'ethers'
import utc from 'dayjs/plugin/utc'
import { blockClient, client } from '../apollo/client'
import { GET_BLOCK, GET_BLOCKS, SHARE_VALUE } from '../apollo/queries'
import { Text } from 'rebass'
import _Decimal from 'decimal.js-light'
import toFormat from 'toformat'
import { timeframeOptions, WETH_ADDRESS, KNC_ADDRESS } from '../constants'
import Numeral from 'numeral'

// format libraries
const Decimal = toFormat(_Decimal)
BigNumber.set({ EXPONENTIAL_AT: 50 })
dayjs.extend(utc)

export function getTimeframe(timeWindow) {
  const utcEndTime = dayjs.utc()
  // based on window, get starttime
  let utcStartTime
  switch (timeWindow) {
    case timeframeOptions.WEEK:
      utcStartTime = utcEndTime.subtract(1, 'week').endOf('day').unix() - 1
      break
    case timeframeOptions.MONTH:
      utcStartTime = utcEndTime.subtract(1, 'month').endOf('day').unix() - 1
      break
    case timeframeOptions.ALL_TIME:
      utcStartTime = utcEndTime.subtract(1, 'year').endOf('day').unix() - 1
      break
    default:
      utcStartTime = utcEndTime.subtract(1, 'year').startOf('year').unix() - 1
      break
  }
  return utcStartTime
}

export function getPoolLink(token0Address, token1Address = null, remove = false, poolAddress = null) {
  const nativeTokenSymbol = getNativeTokenSymbol()

  if (poolAddress) {
    if (!token1Address) {
      return (
        process.env.REACT_APP_DMM_SWAP_URL +
        (remove ? `remove` : `add`) +
        `/${token0Address === WETH_ADDRESS ? nativeTokenSymbol : token0Address}/${nativeTokenSymbol}/${poolAddress}`
      )
    } else {
      return (
        process.env.REACT_APP_DMM_SWAP_URL +
        (remove ? `remove` : `add`) +
        `/${token0Address === WETH_ADDRESS ? nativeTokenSymbol : token0Address}/${
          token1Address === WETH_ADDRESS ? nativeTokenSymbol : token1Address
        }/${poolAddress}`
      )
    }
  }

  if (!token1Address) {
    return (
      process.env.REACT_APP_DMM_SWAP_URL +
      (remove ? `remove` : `add`) +
      `/${token0Address === WETH_ADDRESS ? nativeTokenSymbol : token0Address}/${nativeTokenSymbol}`
    )
  } else {
    return (
      process.env.REACT_APP_DMM_SWAP_URL +
      (remove ? `remove` : `add`) +
      `/${token0Address === WETH_ADDRESS ? nativeTokenSymbol : token0Address}/${
        token1Address === WETH_ADDRESS ? nativeTokenSymbol : token1Address
      }`
    )
  }
}

export function getSwapLink(token0Address, token1Address = null) {
  const nativeTokenSymbol = getNativeTokenSymbol()

  if (!token1Address) {
    return `${process.env.REACT_APP_DMM_SWAP_URL}swap?inputCurrency=${token0Address}`
  } else {
    return `${process.env.REACT_APP_DMM_SWAP_URL}swap?inputCurrency=${
      token0Address === WETH_ADDRESS ? nativeTokenSymbol : token0Address
    }&outputCurrency=${token1Address === WETH_ADDRESS ? nativeTokenSymbol : token1Address}`
  }
}

export function localNumber(val) {
  return Numeral(val).format('0,0')
}

export const toNiceDate = (date) => {
  let x = dayjs.utc(dayjs.unix(date)).format('MMM DD')
  return x
}

export const toWeeklyDate = (date) => {
  const formatted = dayjs.utc(dayjs.unix(date))
  date = new Date(formatted)
  const day = new Date(formatted).getDay()
  var lessDays = day === 6 ? 0 : day + 1
  var wkStart = new Date(new Date(date).setDate(date.getDate() - lessDays))
  var wkEnd = new Date(new Date(wkStart).setDate(wkStart.getDate() + 6))
  return dayjs.utc(wkStart).format('MMM DD') + ' - ' + dayjs.utc(wkEnd).format('MMM DD')
}

export function getTimestampsForChanges() {
  const utcCurrentTime = dayjs()
  const t1 = utcCurrentTime.subtract(1, 'day').startOf('minute').unix()
  const t2 = utcCurrentTime.subtract(2, 'day').startOf('minute').unix()
  const tWeek = utcCurrentTime.subtract(1, 'week').startOf('minute').unix()
  return [t1, t2, tWeek]
}

export async function splitQuery(query, localClient, vars, list, skipCount = 100) {
  let fetchedData = {}
  let allFound = false
  let skip = 0

  while (!allFound) {
    let end = list.length
    if (skip + skipCount < list.length) {
      end = skip + skipCount
    }
    let sliced = list.slice(skip, end)
    let result = await localClient.query({
      query: query(...vars, sliced),
      fetchPolicy: 'cache-first',
    })
    fetchedData = {
      ...fetchedData,
      ...result.data,
    }
    if (Object.keys(result.data).length < skipCount || skip + skipCount > list.length) {
      allFound = true
    } else {
      skip += skipCount
    }
  }

  return fetchedData
}

/**
 * @notice Fetches first block after a given timestamp
 * @dev Query speed is optimized by limiting to a 600-second period
 * @param {Int} timestamp in seconds
 */
export async function getBlockFromTimestamp(timestamp) {
  if (parseInt(timestamp) < parseInt(process.env.REACT_APP_DEFAULT_START_TIME)) {
    timestamp = parseInt(process.env.REACT_APP_DEFAULT_START_TIME)
  }
  let result = await blockClient.query({
    query: GET_BLOCK,
    variables: {
      timestampFrom: timestamp,
      timestampTo: timestamp + 600,
    },
    fetchPolicy: 'cache-first',
  })
  return result?.data?.blocks?.[0]?.number
}

/**
 * @notice Fetches block objects for an array of timestamps.
 * @dev blocks are returned in chronological order (ASC) regardless of input.
 * @dev blocks are returned at string representations of Int
 * @dev timestamps are returns as they were provided; not the block time.
 * @param {Array} timestamps
 */
export async function getBlocksFromTimestamps(timestamps, skipCount = 500) {
  if (timestamps?.length === 0) {
    return []
  }

  timestamps = timestamps.map((t) =>
    parseInt(t) < parseInt(process.env.REACT_APP_DEFAULT_START_TIME)
      ? parseInt(process.env.REACT_APP_DEFAULT_START_TIME)
      : t
  )

  let fetchedData = await splitQuery(GET_BLOCKS, blockClient, [], timestamps, skipCount)

  let blocks = []
  if (fetchedData) {
    for (var t in fetchedData) {
      if (fetchedData[t].length > 0) {
        blocks.push({
          timestamp: t.split('t')[1],
          number: fetchedData[t][0]['number'],
        })
      }
    }
  }
  while (blocks.length < timestamps.length) {
    blocks.push(blocks[blocks.length - 1])
  }
  return blocks
}

export async function getLiquidityTokenBalanceOvertime(account, timestamps) {
  // get blocks based on timestamps
  const blocks = await getBlocksFromTimestamps(timestamps)

  // get historical share values with time travel queries
  let result = await client.query({
    query: SHARE_VALUE(account, blocks),
    fetchPolicy: 'cache-first',
  })

  let values = []
  for (var row in result?.data) {
    let timestamp = row.split('t')[1]
    if (timestamp) {
      values.push({
        timestamp,
        balance: 0,
      })
    }
  }
}

/**
 * @notice Example query using time travel queries
 * @dev TODO - handle scenario where blocks are not available for a timestamps (e.g. current time)
 * @param {String} pairAddress
 * @param {Array} timestamps
 */
export async function getShareValueOverTime(pairAddress, timestamps) {
  if (!timestamps) {
    const utcCurrentTime = dayjs()
    const utcSevenDaysBack = utcCurrentTime.subtract(8, 'day').unix()
    timestamps = getTimestampRange(utcSevenDaysBack, 86400, 7)
  }

  // get blocks based on timestamps
  const blocks = await getBlocksFromTimestamps(timestamps)

  // get historical share values with time travel queries
  let result = await client.query({
    query: SHARE_VALUE(pairAddress, blocks),
    fetchPolicy: 'cache-first',
  })

  let values = []
  for (var row in result?.data) {
    let timestamp = row.split('t')[1]
    let sharePriceUsd = parseFloat(result.data[row]?.reserveUSD) / parseFloat(result.data[row]?.totalSupply)
    if (timestamp) {
      values.push({
        timestamp,
        sharePriceUsd,
        totalSupply: result.data[row].totalSupply,
        reserve0: result.data[row].reserve0,
        reserve1: result.data[row].reserve1,
        reserveUSD: result.data[row].reserveUSD,
        token0DerivedETH: result.data[row].token0.derivedETH,
        token1DerivedETH: result.data[row].token1.derivedETH,
        roiUsd: values && values[0] ? sharePriceUsd / values[0]['sharePriceUsd'] : 1,
        ethPrice: 0,
        token0PriceUSD: 0,
        token1PriceUSD: 0,
      })
    }
  }

  // add eth prices
  let index = 0
  for (var brow in result?.data) {
    let timestamp = brow.split('b')[1]
    if (timestamp) {
      values[index].ethPrice = result.data[brow].ethPrice
      values[index].token0PriceUSD = result.data[brow].ethPrice * values[index].token0DerivedETH
      values[index].token1PriceUSD = result.data[brow].ethPrice * values[index].token1DerivedETH
      index += 1
    }
  }

  return values
}

/**
 * @notice Creates an evenly-spaced array of timestamps
 * @dev Periods include a start and end timestamp. For example, n periods are defined by n+1 timestamps.
 * @param {Int} timestamp_from in seconds
 * @param {Int} period_length in seconds
 * @param {Int} periods
 */
export function getTimestampRange(timestamp_from, period_length, periods) {
  let timestamps = []
  for (let i = 0; i <= periods; i++) {
    timestamps.push(timestamp_from + i * period_length)
  }
  return timestamps
}

export const toNiceDateYear = (date) => dayjs.utc(dayjs.unix(date)).format('MMMM DD, YYYY')

export const isAddress = (value) => {
  try {
    return ethers.utils.getAddress(value.toLowerCase())
  } catch {
    return false
  }
}

export const toK = (num) => {
  return Numeral(num).format('0.[00]a')
}

export const setThemeColor = (theme) => document.documentElement.style.setProperty('--c-token', theme || '#333333')

export const Big = (number) => new BigNumber(number)

export const urls = {
  showTransaction: (tx) => `${process.env.REACT_APP_ETHERSCAN_URL}/tx/${tx}/`,
  showAddress: (address) => `${process.env.REACT_APP_ETHERSCAN_URL}/address/${address}/`,
  showToken: (address) => `${process.env.REACT_APP_ETHERSCAN_URL}/token/${address}/`,
  showBlock: (block) => `${process.env.REACT_APP_ETHERSCAN_URL}/block/${block}/`,
}

export const formatTime = (unix) => {
  const now = dayjs()
  const timestamp = dayjs.unix(unix)

  const inSeconds = now.diff(timestamp, 'second')
  const inMinutes = now.diff(timestamp, 'minute')
  const inHours = now.diff(timestamp, 'hour')
  const inDays = now.diff(timestamp, 'day')

  if (inHours >= 24) {
    return `${inDays} ${inDays === 1 ? 'day' : 'days'} ago`
  } else if (inMinutes >= 60) {
    return `${inHours} ${inHours === 1 ? 'hour' : 'hours'} ago`
  } else if (inSeconds >= 60) {
    return `${inMinutes} ${inMinutes === 1 ? 'minute' : 'minutes'} ago`
  } else {
    return `${inSeconds} ${inSeconds === 1 ? 'second' : 'seconds'} ago`
  }
}

export const formatNumber = (num) => {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

// using a currency library here in case we want to add more in future
var priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
})

export const toSignificant = (number, significantDigits) => {
  Decimal.set({ precision: significantDigits + 1, rounding: Decimal.ROUND_UP })
  const updated = new Decimal(number).toSignificantDigits(significantDigits)
  return updated.toFormat(updated.decimalPlaces(), { groupSeparator: '' })
}

export const formattedNum = (number, usd = false, acceptNegatives = false) => {
  if (isNaN(number) || number === '' || number === undefined) {
    return usd ? '$0' : 0
  }
  let num = parseFloat(number)

  if (num > 500000000) {
    return (usd ? '$' : '') + toK(num.toFixed(0), true)
  }

  if (num === 0) {
    if (usd) {
      return '$0'
    }
    return 0
  }

  if (num < 0.0001 && num > 0) {
    return usd ? '< $0.0001' : '< 0.0001'
  }

  if (num > 1000) {
    return usd
      ? '$' + Number(parseFloat(num).toFixed(0)).toLocaleString()
      : '' + Number(parseFloat(num).toFixed(0)).toLocaleString()
  }

  if (usd) {
    if (num < 0.1) {
      return '$' + Number(parseFloat(num).toFixed(4))
    } else {
      let usdString = priceFormatter.format(num)
      return '$' + usdString.slice(1, usdString.length)
    }
  }

  return Number(parseFloat(num).toFixed(5))
}

export function rawPercent(percentRaw) {
  let percent = parseFloat(percentRaw * 100)
  if (!percent || percent === 0) {
    return '0%'
  }
  if (percent < 1 && percent > 0) {
    return '< 1%'
  }
  return percent.toFixed(0) + '%'
}

export function formattedPercent(percent, useBrackets = false) {
  percent = parseFloat(percent)
  if (!percent || percent === 0) {
    return <Text fontWeight={500}>0%</Text>
  }

  if (percent < 0.0001 && percent > 0) {
    return (
      <Text fontWeight={500} color="green">
        {'< 0.0001%'}
      </Text>
    )
  }

  if (percent < 0 && percent > -0.0001) {
    return (
      <Text fontWeight={500} color="red">
        {'< 0.0001%'}
      </Text>
    )
  }

  let fixedPercent = percent.toFixed(2)
  if (fixedPercent === '0.00') {
    return '0%'
  }
  if (fixedPercent > 0) {
    if (fixedPercent > 100) {
      return <Text fontWeight={500} color="green">{`+${percent?.toFixed(0).toLocaleString()}%`}</Text>
    } else {
      return <Text fontWeight={500} color="green">{`+${fixedPercent}%`}</Text>
    }
  } else {
    return <Text fontWeight={500} color="red">{`${fixedPercent}%`}</Text>
  }
}

export function formattedTokenRatio(percent) {
  percent = parseFloat(percent)

  return (
    <Text fontWeight={500} marginLeft="4px">
      {percent.toFixed(2)}%
    </Text>
  )
}

/**
 * gets the amoutn difference plus the % change in change itself (second order change)
 * @param {*} valueNow
 * @param {*} value24HoursAgo
 * @param {*} value48HoursAgo
 */
export const get2DayPercentChange = (valueNow, value24HoursAgo, value48HoursAgo) => {
  // get volume info for both 24 hour periods
  let currentChange = parseFloat(valueNow) - parseFloat(value24HoursAgo)
  let previousChange = parseFloat(value24HoursAgo) - parseFloat(value48HoursAgo)

  const adjustedPercentChange = (parseFloat(currentChange - previousChange) / parseFloat(previousChange)) * 100

  if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
    return [currentChange, 0]
  }
  return [currentChange, adjustedPercentChange]
}

/**
 * get standard percent change between two values
 * @param {*} valueNow
 * @param {*} value24HoursAgo
 */
export const getPercentChange = (valueNow, value24HoursAgo) => {
  const adjustedPercentChange =
    ((parseFloat(valueNow) - parseFloat(value24HoursAgo)) / parseFloat(value24HoursAgo)) * 100
  if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
    return 0
  }
  return adjustedPercentChange
}

export function isEquivalent(a, b) {
  var aProps = Object.getOwnPropertyNames(a)
  var bProps = Object.getOwnPropertyNames(b)
  if (aProps.length !== bProps.length) {
    return false
  }
  for (var i = 0; i < aProps.length; i++) {
    var propName = aProps[i]
    if (a[propName] !== b[propName]) {
      return false
    }
  }
  return true
}

/**
 * Shorten the checksummed version of the input address to have 0x + 4 characters at start and end
 *
 * @param string address
 * @param number chars
 */
export function shortenAddress(address, chars = 4) {
  const parsed = isAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}

export function getNativeTokenSymbol() {
  switch (process.env.REACT_APP_CHAIN_ID) {
    case '137':
      return 'MATIC'
    case '80001':
      return 'MATIC'
    case '56':
      return 'BNB'
    case '97':
      return 'BNB'
    case '43114':
      return 'AVAX'
    default:
      return 'ETH'
  }
}

export function getNativeTokenWrappedName() {
  switch (process.env.REACT_APP_CHAIN_ID) {
    case '137':
      return 'Matic (Wrapped)'
    case '80001':
      return 'Matic (Wrapped)'
    case '56':
      return 'BNB (Wrapped)'
    case '97':
      return 'BNB (Wrapped)'
    case '43114':
      return 'AVAX (Wrapped)'
    default:
      return 'Ether (Wrapped)'
  }
}

export function getEtherscanLinkText() {
  switch (process.env.REACT_APP_CHAIN_ID) {
    case '137':
      return 'Polygonscan'
    case '80001':
      return 'Polygonscan'
    case '56':
      return 'Bscscan'
    case '97':
      return 'Bscscan'
    default:
      return 'Etherscan'
  }
}

export function getNetworkName() {
  switch (process.env.REACT_APP_CHAIN_ID) {
    case '137':
      return 'Polygon'
    case '80001':
      return 'Polygon'
    case '56':
      return 'BSC'
    case '97':
      return 'BSC'
    default:
      return 'Ethereum'
  }
}

export function getDefaultAddLiquidityUrl() {
  switch (process.env.REACT_APP_CHAIN_ID) {
    case '137':
      return `${process.env.REACT_APP_DMM_SWAP_URL}pools/0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619/${KNC_ADDRESS}`
    case '80001':
      return `${process.env.REACT_APP_DMM_SWAP_URL}pools/0x19395624C030A11f58e820C3AeFb1f5960d9742a/${KNC_ADDRESS}`
    case '56':
      return `${process.env.REACT_APP_DMM_SWAP_URL}pools/BNB`
    case '97':
      return `${process.env.REACT_APP_DMM_SWAP_URL}pools/BNB`
    default:
      return `${process.env.REACT_APP_DMM_SWAP_URL}pools/ETH/${KNC_ADDRESS}`
  }
}
