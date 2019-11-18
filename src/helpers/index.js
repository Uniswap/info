import { BigNumber } from 'bignumber.js'
import dayjs from 'dayjs'
import { client } from '../apollo/client'
import { ExportToCsv } from 'export-to-csv'
import { ethers } from 'ethers'

import { TRANSACTIONS_QUERY_SKIPPABLE } from '../apollo/queries'

BigNumber.set({ EXPONENTIAL_AT: 50 })

export const toNiceDate = date => dayjs(date).format('MMM DD')

export const toNiceDateYear = date => dayjs(date).format('MMMM DD, YYYY')

export const isAddress = value => {
  try {
    return ethers.utils.getAddress(value.toLowerCase())
  } catch {
    return false
  }
}

export const isWeb3Available = async () => {
  /* eslint-disable */
  if (typeof window.ethereum !== 'undefined') {
    window.web3 = new Web3(ethereum)
    try {
      await ethereum.enable()
      return true
    } catch (error) {
      return false
    }
  } else if (typeof window.web3 !== 'undefined') {
    window.web3 = new Web3(web3.currentProvider)
    return true
  } else {
    return false
  }
  /* eslint-enable */
}

export const toK = (num, fixed) => {
  const formatter = divideBy => (fixed === true ? Number(num / divideBy).toFixed(4) : Number(num / divideBy))

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

export const getAllTransactions = async address => {
  // current time
  const utcEndTime = dayjs.utc()
  let utcStartTime
  utcStartTime = utcEndTime.subtract(1, 'year').startOf('day')
  let startTime = utcStartTime.unix() - 1 // -1 because we filter on greater than in the query
  let data = []
  let skipCount = 0
  let fetchingData = true

  while (fetchingData) {
    let result = await client.query({
      query: TRANSACTIONS_QUERY_SKIPPABLE,
      variables: {
        exchangeAddr: address,
        skip: skipCount
      },
      fetchPolicy: 'network-only'
    })
    if (result) {
      skipCount = skipCount + 100
      if (result.data.transactions.length === 0) {
        fetchingData = false
      } else if (result.data.transactions[result.data.transactions.length - 1].timestamp < startTime) {
        fetchingData = false
      }
      data = data.concat(result.data.transactions)
    }
  }

  const options = {
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalSeparator: '.',
    showLabels: true,
    showTitle: true,
    title: 'My Awesome CSV',
    useTextFile: false,
    useBom: true,
    useKeysAsHeaders: true
    // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
  }
  let csvdata = []
  Object.keys(data).map(index => {
    return csvdata.push(data[index])
  })
  const csvExporter = new ExportToCsv(options)
  csvExporter.generateCsv(data)
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
    return 0
  }
  if (num < 0.0001) {
    return '< 0.0001'
  }

  if (num > 1000) {
    return Number(parseFloat(num).toFixed(0)).toLocaleString()
  }

  if (usd) {
    if (num < 0.01) {
      return Number(parseFloat(num).toFixed(4))
    }
    let usdString = priceFormatter.format(num)
    return usdString.slice(1, usdString.length)
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
  const adjustedPercentChange = (((valueNow - value24HoursAgo) / value24HoursAgo) * 100).toFixed(2)
  adjustedPercentChange > 0 ? (percentChange = '+') : (percentChange = '')
  percentChange += adjustedPercentChange

  if (isNaN(percentChange)) {
    return 0
  }

  return percentChange
}
