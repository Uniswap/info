import React from 'react'
import { BigNumber } from 'bignumber.js'
import dayjs from 'dayjs'
import { ethers } from 'ethers'
import utc from 'dayjs/plugin/utc'
import { Text } from 'rebass'
import _Decimal from 'decimal.js-light'
import toFormat from 'toformat'
import { timeframeOptions } from '../constants'
import Numeral from 'numeral'

// format libraries
const Decimal = toFormat(_Decimal)
BigNumber.set({ EXPONENTIAL_AT: 50 })
dayjs.extend(utc)

export const parseRawNumber = (amount, decimals) =>
  ethers.utils.formatUnits(new ethers.utils.BigNumber(amount), decimals)

export function getTimeframe(timeWindow) {
  const utcEndTime = dayjs.utc()
  // based on window, get starttime
  let utcStartTime
  switch (timeWindow) {
    case timeframeOptions.WEEK:
      utcStartTime =
        utcEndTime
          .subtract(1, 'week')
          .endOf('day')
          .unix() - 1
      break
    case timeframeOptions.MONTH:
      utcStartTime =
        utcEndTime
          .subtract(1, 'month')
          .endOf('day')
          .unix() - 1
      break
    case timeframeOptions.ALL_TIME:
      utcStartTime =
        utcEndTime
          .subtract(1, 'year')
          .endOf('day')
          .unix() - 1
      break
    default:
      utcStartTime =
        utcEndTime
          .subtract(1, 'year')
          .startOf('year')
          .unix() - 1
      break
  }
  return utcStartTime
}

export function localNumber(val) {
  return Numeral(val).format('0,0')
}

export const toNiceDate = date => {
  let x = dayjs.utc(dayjs.unix(date)).format('MMM DD')
  return x
}

export const toWeeklyDate = date => {
  const formatted = dayjs.utc(dayjs.unix(date))
  date = new Date(formatted)
  const day = new Date(formatted).getDay()
  var lessDays = day === 6 ? 0 : day + 1
  var wkStart = new Date(new Date(date).setDate(date.getDate() - lessDays))
  var wkEnd = new Date(new Date(wkStart).setDate(wkStart.getDate() + 6))
  return dayjs.utc(wkStart).format('MMM DD') + ' - ' + dayjs.utc(wkEnd).format('MMM DD')
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

export const toNiceDateYear = date => dayjs.utc(dayjs.unix(date)).format('MMMM DD, YYYY')

export const isAddress = value => {
  try {
    return ethers.utils.getAddress(value.toLowerCase())
  } catch {
    return false
  }
}

export const toK = num => {
  return Numeral(num).format('0.[00]a')
}

export const setThemeColor = theme => document.documentElement.style.setProperty('--c-token', theme || '#333333')

export const Big = number => new BigNumber(number)

export const formatDate = unix => {
  const timestamp = dayjs.unix(unix)
  return dayjs(timestamp).format('DD MMM YYYY h:mm A')
}

export const formatTime = unix => {
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

export const formatNumber = num => {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

// using a currency library here in case we want to add more in future
var priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
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

export function safeAccess(object, path) {
  return object
    ? path.reduce(
        (accumulator, currentValue) => (accumulator && accumulator[currentValue] ? accumulator[currentValue] : null),
        object
      )
    : null
}
