import { TOKEN_OVERRIDES } from 'constants/tokens'
import { ITokenDataController } from 'data/types/TokenController.interface'
import dayjs from 'dayjs'
import { client } from 'service/client'
import { PRICES_BY_BLOCK } from 'service/queries/ethereum/global'
import { GET_TOKENS, TOKEN_CHART, TOKEN_DATA, TOKEN_SEARCH } from 'service/queries/ethereum/tokens'
import { TokensQuery, Token as ETHToken, TokenDataQuery } from 'service/generated/ethereumGraphql'
import { TokenDayData } from 'state/features/token/types'
import {
  getBlockFromTimestamp,
  get2DayPercentChange,
  getPercentChange,
  getBlocksFromTimestamps,
  splitQuery
} from 'utils'

async function fetchTokens(block?: number) {
  return client.query<TokensQuery>({
    query: GET_TOKENS,
    variables: {
      block: block ? { number: block } : null
    }
  })
}

async function fetchTokenData(tokenAddress: string, block?: number) {
  return client.query<TokenDataQuery>({
    query: TOKEN_DATA,
    variables: {
      tokenAddress,
      block: block ? { number: block } : null
    }
  })
}

function parseToken(
  data: ETHToken,
  price: number,
  priceOld: number,
  oneDayHistory?: ETHToken,
  twoDayHistory?: ETHToken
): Token {
  const oneDayDerivedEth = oneDayHistory ? +oneDayHistory.derivedETH : 0
  const oneDayTotalLiquidity = oneDayHistory ? +oneDayHistory.totalLiquidity : 0
  const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
    data.tradeVolumeUSD,
    oneDayHistory?.tradeVolumeUSD ?? 0,
    twoDayHistory?.tradeVolumeUSD ?? 0
  )
  const [oneDayTxns, txnChange] = get2DayPercentChange(
    data.txCount,
    oneDayHistory?.txCount ?? 0,
    twoDayHistory?.txCount ?? 0
  )
  const [oneDayVolumeUT, volumeChangeUT] = get2DayPercentChange(
    data.untrackedVolumeUSD,
    oneDayHistory?.untrackedVolumeUSD ?? 0,
    twoDayHistory?.untrackedVolumeUSD ?? 0
  )
  // percent changes
  const priceChangeUSD = getPercentChange(+data?.derivedETH * price, oneDayDerivedEth * priceOld)
  const currentLiquidityUSD = +data?.totalLiquidity * price * +data?.derivedETH
  const oldLiquidityUSD = oneDayTotalLiquidity * priceOld * oneDayDerivedEth

  const tokenInfo: Token = {
    ...data,
    totalLiquidity: +data.totalLiquidity,
    tradeVolumeUSD: +data.tradeVolumeUSD,
    txCount: +data.txCount,
    untrackedVolumeUSD: +data.untrackedVolumeUSD,
    derivedETH: +data.derivedETH,
    priceUSD: +data?.derivedETH * price,
    totalLiquidityUSD: currentLiquidityUSD,
    oneDayVolumeUT: oneDayVolumeUT,
    volumeChangeUT: volumeChangeUT,
    oneDayVolumeUSD,
    volumeChangeUSD,
    priceChangeUSD,
    liquidityChangeUSD: getPercentChange(currentLiquidityUSD ?? 0, oldLiquidityUSD ?? 0),
    oneDayTxns,
    txnChange,
    name: TOKEN_OVERRIDES[data.id]?.name ?? data.name,
    symbol: TOKEN_OVERRIDES[data.id]?.symbol ?? data.symbol
  }

  // new tokens
  if (!oneDayHistory && data) {
    tokenInfo.oneDayVolumeUSD = +data.tradeVolumeUSD
    tokenInfo.oneDayTxns = +data.txCount
  }

  return tokenInfo
}

export default class TokenDataController implements ITokenDataController {
  async searchToken(value: string, id: string) {
    return client.query({
      query: TOKEN_SEARCH,
      variables: {
        value,
        id
      }
    })
  }
  async getTopTokens(price: number, priceOld: number) {
    const utcCurrentTime = dayjs()
    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix()
    const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix()
    const oneDayBlock = await getBlockFromTimestamp(utcOneDayBack)
    const twoDayBlock = await getBlockFromTimestamp(utcTwoDaysBack)

    try {
      const current = await fetchTokens()
      const oneDayResult = await fetchTokens(oneDayBlock)
      const twoDayResult = await fetchTokens(twoDayBlock)

      const oneDayData = oneDayResult?.data?.tokens.reduce<Record<string, ETHToken>>(
        (obj, cur) => ({ ...obj, [cur.id]: cur }),
        {}
      )

      const twoDayData = twoDayResult?.data?.tokens.reduce<Record<string, ETHToken>>(
        (obj, cur) => ({ ...obj, [cur.id]: cur }),
        {}
      )

      const bulkResults = await Promise.all(
        current &&
          oneDayData &&
          twoDayData &&
          current?.data?.tokens.map(async token => {
            const data = { ...token }

            let oneDayHistory = oneDayData?.[token.id]
            let twoDayHistory = twoDayData?.[token.id]

            // catch the case where token wasnt in top list in previous days
            if (!oneDayHistory) {
              const oneDayResult = await fetchTokenData(token.id, oneDayBlock)
              oneDayHistory = oneDayResult.data.tokens[0]
            }
            if (!twoDayHistory) {
              const twoDayResult = await fetchTokenData(token.id, twoDayBlock)
              twoDayHistory = twoDayResult.data.tokens[0]
            }
            return parseToken(data, price, priceOld, oneDayHistory, twoDayHistory)
          })
      )

      return bulkResults
    } catch (e) {
      return []
    }
  }
  async getTokenData(address: string, price: number, priceOld: number) {
    const utcCurrentTime = dayjs()
    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').startOf('minute').unix()
    const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').startOf('minute').unix()
    const oneDayBlock = await getBlockFromTimestamp(utcOneDayBack)
    const twoDayBlock = await getBlockFromTimestamp(utcTwoDaysBack)

    // fetch all current and historical data
    const result = await fetchTokenData(address)
    const data = { ...result?.data?.tokens?.[0] }
    if (data) {
      // get results from 24 hours in past
      const oneDayResult = await fetchTokenData(address, oneDayBlock)
      const oneDayData = { ...oneDayResult.data.tokens[0] }

      // get results from 48 hours in past
      const twoDayResult = await fetchTokenData(address, twoDayBlock)
      const twoDayData = { ...twoDayResult.data.tokens[0] }

      return parseToken(data, price, priceOld, oneDayData, twoDayData)
    }
    return
  }
  async getTokenPairs(tokenAddress: string) {
    // fetch all current and historical data
    const result = await fetchTokenData(tokenAddress)
    return result.data?.['pairs0'].concat(result.data?.['pairs1']).map((p: { id: string }) => p.id)
  }
  async getIntervalTokenData(tokenAddress: string, startTime: number, interval: number, latestBlock: number) {
    const utcEndTime = dayjs.utc()
    let time = startTime

    // create an array of hour start times until we reach current hour
    // buffer by half hour to catch case where graph isnt synced to latest block
    const timestamps = []
    while (time < utcEndTime.unix()) {
      timestamps.push(time)
      time += interval
    }

    // backout if invalid timestamp format
    if (timestamps.length === 0) {
      return []
    }

    // once you have all the timestamps, get the blocks for each timestamp in a bulk query
    let blocks
    try {
      blocks = await getBlocksFromTimestamps(timestamps, 100)

      // catch failing case
      if (!blocks || blocks.length === 0) {
        return []
      }

      if (latestBlock) {
        blocks = blocks.filter(b => b.number <= latestBlock)
      }

      // FIXME: refactor splitQuery
      const result: any = await splitQuery(
        (params: BlockHeight[]) =>
          client.query({
            query: PRICES_BY_BLOCK(tokenAddress, params)
          }),
        blocks,
        50
      )
      // format token ETH price results
      const values: { timestamp: string; derivedETH: number; priceUSD?: number }[] = []
      for (const row in result) {
        const timestamp = row.split('t')[1]
        const derivedETH = parseFloat(result[row]?.derivedETH)
        if (timestamp) {
          values.push({
            timestamp,
            derivedETH
          })
        }
      }

      // go through eth usd prices and assign to original values array
      let index = 0
      for (const brow in result) {
        const timestamp = brow.split('b')[1]
        if (timestamp) {
          if (result[brow]) {
            values[index].priceUSD = result[brow].ethPrice * values[index].derivedETH
          }
          index += 1
        }
      }

      const formattedHistory: TimeWindowItem[] = []

      // for each hour, construct the open and close price
      for (let i = 0; i < values.length - 1; i++) {
        formattedHistory.push({
          timestamp: values[i].timestamp,
          open: values[i].priceUSD!,
          close: values[i + 1].priceUSD!
        })
      }

      return formattedHistory
    } catch (e) {
      console.log(e)
      console.log('error fetching blocks')
      return []
    }
  }
  async getTokenChartData(tokenAddress: string) {
    let data: TokenDayData[] = []
    const utcEndTime = dayjs.utc()
    const utcStartTime = utcEndTime.subtract(1, 'year')
    const startTime = utcStartTime.startOf('minute').unix() - 1

    try {
      let allFound = false
      let skip = 0
      while (!allFound) {
        const result = await client.query({
          query: TOKEN_CHART,
          variables: {
            tokenAddr: tokenAddress,
            skip
          }
        })
        if (result.data.tokenDayDatas.length < 1000) {
          allFound = true
        }
        skip += 1000
        data = data.concat(result.data.tokenDayDatas)
      }

      const dayIndexSet = new Set()
      const dayIndexArray: TokenDayData[] = []
      const oneDay = 24 * 60 * 60
      data.forEach((dayData, i) => {
        // add the day index to the set of days
        dayIndexSet.add((data[i].date / oneDay).toFixed(0))
        dayIndexArray.push(data[i])
        dayData.dailyVolumeUSD = +dayData.dailyVolumeUSD
      })

      // fill in empty days
      let timestamp = data[0] && data[0].date ? data[0].date : startTime
      let latestLiquidityUSD = data[0] && data[0].totalLiquidityUSD
      let latestPriceUSD = data[0] && data[0].priceUSD
      let index = 1
      while (timestamp < utcEndTime.startOf('minute').unix() - oneDay) {
        const nextDay = timestamp + oneDay
        const currentDayIndex = (nextDay / oneDay).toFixed(0)
        if (!dayIndexSet.has(currentDayIndex)) {
          data.push({
            date: nextDay,
            dayString: nextDay,
            dailyVolumeUSD: 0,
            priceUSD: latestPriceUSD,
            totalLiquidityUSD: latestLiquidityUSD
          })
        } else {
          latestLiquidityUSD = dayIndexArray[index].totalLiquidityUSD
          latestPriceUSD = dayIndexArray[index].priceUSD
          index = index + 1
        }
        timestamp = nextDay
      }
      data = data.sort((a, b) => (a.date > b.date ? 1 : -1))
    } catch (e) {
      console.error(e)
    }

    return data
  }
}
