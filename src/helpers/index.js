import { BigNumber } from 'bignumber.js'
import dayjs from 'dayjs'
import { ethers } from 'ethers'
import utc from 'dayjs/plugin/utc'

BigNumber.set({ EXPONENTIAL_AT: 50 })

dayjs.extend(utc)

export const toNiceDate = date => {
  // let df = new Date(date * 1000).toUTCString('MMMM DD')
  let x = dayjs.utc(dayjs.unix(date)).format('MMM DD')
  return x
}

export const toNiceDateYear = date => dayjs.utc(dayjs.unix(date)).format('MMMM DD, YYYY')

export const isAddress = value => {
  try {
    return ethers.utils.getAddress(value.toLowerCase())
  } catch {
    return false
  }
}

export const toK = (num, fixed, cutoff = false) => {
  const formatter = divideBy =>
    fixed === true
      ? cutoff
        ? Number(num / divideBy).toFixed(0)
        : Number(num / divideBy).toFixed(4)
      : Number(num / divideBy)
  if (num > 999999 || num < -999999) {
    return `${formatter(1000000)}M`
  } else if (num > 999 || num < -999) {
    return `${formatter(1000)}K`
  } else {
    return formatter(1)
  }
}

export const setThemeColor = theme => document.documentElement.style.setProperty('--c-token', theme || '#333333')

export const Big = number => new BigNumber(number)

export const urls = {
  showTransaction: tx => `https://etherscan.io/tx/${tx}/`,
  showAddress: address => `https://www.etherscan.io/address/${address}/`,
  showToken: address => `https://www.etherscan.io/token/${address}/`,
  showBlock: block => `https://etherscan.io/block/${block}/`
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
  currency: 'USD'
})

export const formattedNum = (number, usd = false) => {
  if (isNaN(number) || number === '') {
    return ''
  }
  let num = parseFloat(number)
  if (num === 0) {
    if (usd) {
      return '$0'
    }
    return 0
  }
  if (num < 0.0001) {
    return usd ? '< $0.0001' : '< 0.0001'
  }

  if (num > 1000) {
    return Number(parseFloat(num).toFixed(0)).toLocaleString()
  }

  if (usd) {
    if (num < 0.01) {
      if (usd) {
        return '$' + Number(parseFloat(num).toFixed(4))
      }
      return Number(parseFloat(num).toFixed(4))
    }
    let usdString = priceFormatter.format(num)
    return '$' + usdString.slice(1, usdString.length)
  }
  return Number(parseFloat(num).toFixed(4))
}

export const get2DayPercentFormatted = (valueNow, value24HoursAgo, value48HoursAgo) => {
  // get volume info for both 24 hour periods
  let firstDayValue = value24HoursAgo - value48HoursAgo
  let secondDayValue = valueNow - value24HoursAgo
  let amountChange = secondDayValue - firstDayValue

  let percentChange = ''
  const adjustedPercentChange = ((amountChange / firstDayValue) * 100).toFixed(2)
  adjustedPercentChange > 0 ? (percentChange = '+') : (percentChange = '')
  percentChange += adjustedPercentChange

  if (isNaN(percentChange) || !isFinite(percentChange)) {
    return [secondDayValue, 0]
  }

  return [secondDayValue, percentChange]
}

export const getPercentFormatted = (valueNow, value24HoursAgo) => {
  let percentChange = ''
  const adjustedPercentChange = ((valueNow - value24HoursAgo) / value24HoursAgo).toFixed(2)
  adjustedPercentChange > 0 ? (percentChange = '+') : (percentChange = '')
  percentChange += adjustedPercentChange

  if (isNaN(percentChange)) {
    return 0
  }

  return percentChange
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
