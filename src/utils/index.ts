import { BigNumber } from 'bignumber.js'
import dayjs from 'dayjs'
import { ethers } from 'ethers'
import { timeframeOptions } from 'constants/index'
import { NetworkInfo, SupportedNetwork, SUPPORTED_NETWORK_VERSIONS } from 'constants/networks'
import Numeral from 'numeral'
import { TronNetworkInfo } from 'constants/networks'
import { GET_BLOCK, GET_BLOCKS, SHARE_VALUE } from 'service/queries/global'
import { client } from 'service/client'
import { ApolloQueryResult } from 'apollo-boost'

BigNumber.set({ EXPONENTIAL_AT: 50 })

export function getTimeframe(timeWindow: string) {
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

function parseAddress0ForRoute(token0Address: string) {
  switch (token0Address) {
    case '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2':
      return 'ETH'

    case 'TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR':
      return 'TRX'

    default:
      return token0Address
  }
}

function parseAddress1ForRoute(network: SupportedNetwork, token1Address: string | null) {
  switch (token1Address) {
    case null:
      return network.toUpperCase()

    case '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2':
      return 'ETH'

    case 'TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR':
      return 'TRX'

    default:
      return token1Address
  }
}

export function getPoolLink(network: SupportedNetwork, token0Address: string, token1Address = null, remove = false) {
  const poolPage = remove ? 'remove' : 'add'
  const updatedAddress0 = parseAddress0ForRoute(token0Address)
  const updatedAddress1 = parseAddress1ForRoute(network, token1Address)
  return `https://app.ws.exchange/${network}/${poolPage}/${updatedAddress0}/${updatedAddress1}`
}

export function getSwapLink(network: SupportedNetwork, token0Address: string, token1Address = null) {
  const updatedAddress0 = parseAddress0ForRoute(token0Address)
  if (!token1Address) {
    return `https://app.ws.exchange/${network}/swap?inputCurrency=${updatedAddress0}`
  }
  const updatedAddress1 = parseAddress1ForRoute(network, token1Address)
  return `https://app.ws.exchange/${network}/swap?inputCurrency=${updatedAddress0}&outputCurrency=${updatedAddress1}`
}

export function getMiningPoolLink(network: SupportedNetwork, token0Address: string) {
  return `https://app.ws.exchange/${network}/stake/${network.toUpperCase()}/${token0Address}`
}

export function getWhiteSwapAppLink(network: SupportedNetwork, linkVariable: string) {
  const baseWhiteSwapUrl = `https://app.ws.exchange/${network}/stake`
  if (!linkVariable) {
    return baseWhiteSwapUrl
  }

  return `${baseWhiteSwapUrl}/${network.toUpperCase()}/${linkVariable}`
}

export function localNumber(val: string) {
  return Numeral(val).format('0,0')
}

export const toNiceDate = (date: number) => {
  const x = dayjs.utc(dayjs.unix(date)).format('MMM DD')
  return x
}

export function getTimestampsForChanges() {
  const utcCurrentTime = dayjs()
  const t1 = utcCurrentTime.subtract(1, 'day').startOf('minute').unix()
  const t2 = utcCurrentTime.subtract(2, 'day').startOf('minute').unix()
  const tWeek = utcCurrentTime.subtract(1, 'week').startOf('minute').unix()
  return [t1, t2, tWeek]
}

export async function splitQuery<T>(
  callback: (p: T[]) => Promise<ApolloQueryResult<any>>,
  list: T[],
  skipCount = 100
): Promise<any> {
  let fetchedData = {}
  let allFound = false
  let skip = 0

  while (!allFound) {
    let end = list.length
    if (skip + skipCount < list.length) {
      end = skip + skipCount
    }
    const sliced = list.slice(skip, end)
    const result = await callback(sliced)
    fetchedData = {
      ...fetchedData,
      ...result.data
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
export async function getBlockFromTimestamp(timestamp: number) {
  const result = await client.query({
    query: GET_BLOCK,
    variables: {
      timestampFrom: timestamp,
      timestampTo: timestamp + 600
    },
    context: {
      client: 'block'
    }
  })
  return +result?.data?.blocks?.[0]?.number
}

/**
 * @notice Fetches block objects for an array of timestamps.
 * @dev blocks are returned in chronological order (ASC) regardless of input.
 * @dev blocks are returned at string representations of Int
 * @dev timestamps are returns as they were provided; not the block time.
 * @param {Array} timestamps
 */
export async function getBlocksFromTimestamps(timestamps: number[], skipCount = 500) {
  if (timestamps?.length === 0) {
    return []
  }

  const fetchedData = await splitQuery(
    params =>
      client.query({
        query: GET_BLOCKS(params),
        context: {
          client: 'block'
        }
      }),
    timestamps,
    skipCount
  )

  const blocks = []
  if (fetchedData) {
    for (const t in fetchedData) {
      if (fetchedData[t].length > 0) {
        blocks.push({
          timestamp: t.split('t')[1],
          number: +fetchedData[t][0]['number']
        })
      }
    }
  }
  return blocks
}

/**
 * @notice Example query using time travel queries
 * @dev TODO - handle scenario where blocks are not available for a timestamps (e.g. current time)
 * @param {String} pairAddress
 * @param {Array} timestamps
 */
export async function getShareValueOverTime(pairAddress: string, timestamps: number[]) {
  if (!timestamps) {
    const utcCurrentTime = dayjs()
    const utcSevenDaysBack = utcCurrentTime.subtract(8, 'day').unix()
    timestamps = getTimestampRange(utcSevenDaysBack, 86400, 7)
  }

  // get blocks based on timestamps
  const blocks = await getBlocksFromTimestamps(timestamps)

  // get historical share values with time travel queries
  const result = await client.query({
    query: SHARE_VALUE(pairAddress, blocks)
  })

  const values: any[] = []
  for (const row in result?.data) {
    const timestamp = row.split('t')[1]
    const sharePriceUsd = parseFloat(result.data[row]?.reserveUSD) / parseFloat(result.data[row]?.totalSupply)
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
        token1PriceUSD: 0
      })
    }
  }

  // add eth prices
  let index = 0
  for (const brow in result?.data) {
    const timestamp = brow.split('b')[1]
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
export function getTimestampRange(timestamp_from: number, period_length: number, periods: number) {
  const timestamps = []
  for (let i = 0; i <= periods; i++) {
    timestamps.push(timestamp_from + i * period_length)
  }
  return timestamps
}

export const toNiceDateYear = (date: number) => dayjs.utc(dayjs.unix(date)).format('MMMM DD, YYYY')

export const isAddress = (value: string) => {
  try {
    return ethers.utils.getAddress(value.toLowerCase())
  } catch {
    return false
  }
}

export const toK = (num: string) => {
  return Numeral(num).format('0.[00]a')
}

const BLOCK_CHAIN_SCAN_URL: Record<SupportedNetwork, string> = {
  [SupportedNetwork.ETHEREUM]: 'https://etherscan.io',
  [SupportedNetwork.TRON]: 'https://tronscan.org/#'
}

export function getBlockChainScanLink(
  networkId: SupportedNetwork,
  data: string,
  type: 'transaction' | 'token' | 'address' | 'block'
): string {
  const scanUrl = BLOCK_CHAIN_SCAN_URL[networkId]

  switch (type) {
    case 'transaction': {
      if (networkId === SupportedNetwork.ETHEREUM) {
        return `${scanUrl}/tx/${data}`
      }
      return `${scanUrl}/transaction/${data}`
    }
    case 'token': {
      if (networkId === SupportedNetwork.ETHEREUM) {
        return `${scanUrl}/token/${data}`
      }
      return `${scanUrl}/token20/${data}`
    }
    case 'block': {
      return `${scanUrl}/block/${data}`
    }
    case 'address':
    default: {
      return `${scanUrl}/address/${data}`
    }
  }
}

export const formatTime = (unix: number) => {
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

export const formatNumber = (num: number) => {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

// using a currency library here in case we want to add more in future
const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const formattedNum = (number?: number | string, usd = false) => {
  if (Number.isNaN(number) || number === '' || number === undefined) {
    return usd ? '$0' : 0
  }
  const num = typeof number === 'string' ? parseFloat(number) : number

  if (num > 500000000) {
    return (usd ? '$' : '') + toK(num.toFixed(0))
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
    return usd ? '$' + Number(num.toFixed(0)).toLocaleString() : '' + Number(num.toFixed(0)).toLocaleString()
  }

  if (usd) {
    if (num < 0.1) {
      return '$' + Number(num.toFixed(4))
    } else {
      const usdString = priceFormatter.format(num)
      return '$' + usdString.slice(1, usdString.length)
    }
  }

  return Number(num.toFixed(5))
}

export function rawPercent(percentRaw: number) {
  const percent = percentRaw * 100
  if (!percent || percent === 0) {
    return '0%'
  }
  if (percent < 1 && percent > 0) {
    return '< 1%'
  }
  return percent.toFixed(0) + '%'
}

export function parsePercent(percent: number) {
  if (!percent || percent === 0) {
    return { data: '0%' }
  }

  if (percent < 0.0001 && percent > 0) {
    return { data: '< 0.0001%', color: '#54B45D' }
  }

  if (percent < 0 && percent > -0.0001) {
    return { data: '< 0.0001%', color: '#C73846' }
  }

  const fixedPercent = percent.toFixed(2)
  if (fixedPercent === '0.00') {
    return { data: '0%' }
  }
  if (+fixedPercent > 0) {
    if (+fixedPercent > 100) {
      return { data: `+${percent?.toFixed(0).toLocaleString()}%`, color: '#54B45D' }
    } else {
      return { data: `+${fixedPercent}%`, color: '#54B45D' }
    }
  } else {
    return { data: `${fixedPercent}%`, color: '#C73846' }
  }
}

/**
 * gets the amoutn difference plus the % change in change itself (second order change)
 * @param {*} valueNow
 * @param {*} value24HoursAgo
 * @param {*} value48HoursAgo
 */
export const get2DayPercentChange = (valueNow: any, value24HoursAgo: any, value48HoursAgo: any) => {
  // get volume info for both 24 hour periods
  const currentChange = parseFloat(valueNow) - parseFloat(value24HoursAgo)
  const previousChange = parseFloat(value24HoursAgo) - parseFloat(value48HoursAgo)

  const adjustedPercentChange = ((currentChange - previousChange) / previousChange) * 100

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
export const getPercentChange = (valueNow: any, value24HoursAgo: any) => {
  const adjustedPercentChange =
    ((parseFloat(valueNow) - parseFloat(value24HoursAgo)) / parseFloat(value24HoursAgo)) * 100
  if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
    return 0
  }
  return adjustedPercentChange
}

export function networkPrefix(activeNetwork: NetworkInfo) {
  const prefix = '/' + activeNetwork.route.toLocaleLowerCase()
  return prefix
}

export function getCurrentNetwork() {
  const locationNetworkId = location.pathname.split('/')[1]
  const newNetworkInfo = SUPPORTED_NETWORK_VERSIONS.find(n => locationNetworkId === n.route.toLowerCase())
  if (newNetworkInfo) {
    return newNetworkInfo
  } else {
    return TronNetworkInfo
  }
}

export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}
