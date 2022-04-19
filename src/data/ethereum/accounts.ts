import { accountApi, pairApi } from 'api'
import dayjs from 'dayjs'
import { LiquidityChart, LiquiditySnapshot, Position } from 'state/features/account/types'
import { getLPReturnsOnPair } from 'utils/returns'

type OwnershipPair = {
  lpTokenBalance: string
  timestamp: number
}

export async function getUserTransactions(account: string) {
  try {
    const result = await accountApi.getUserTransactions(account)
    return result.data
  } catch (e) {
    console.log(e)
    return {}
  }
}

export async function getUserHistory(account: string) {
  try {
    let skip = 0
    let allResults: LiquiditySnapshot[] = []
    let found = false
    while (!found) {
      const result = await accountApi.getUserLiquidityPositionSnapshots(account, skip)
      allResults = allResults.concat(result.data.liquidityPositionSnapshots)
      if (result.data.liquidityPositionSnapshots.length < 1000) {
        found = true
      } else {
        skip += 1000
      }
    }
    return allResults
  } catch (e) {
    console.log(e)
    return []
  }
}

export async function getUserLiquidityChart(
  startDateTimestamp: number,
  history: LiquiditySnapshot[]
): Promise<LiquidityChart[]> {
  let dayIndex = startDateTimestamp / 86400 // get unique day bucket unix
  const currentDayIndex = dayjs.utc().unix() / 86400

  // sort snapshots in order
  const sortedPositions = history.sort((a, b) => {
    return a.timestamp > b.timestamp ? 1 : -1
  })
  // if UI start time is > first position time - bump start index to this time
  if (sortedPositions[0].timestamp > dayIndex) {
    dayIndex = sortedPositions[0].timestamp / 86400
  }

  const dayTimestamps = []
  // get date timestamps for all days in view
  while (dayIndex < currentDayIndex) {
    dayTimestamps.push(dayIndex * 86400)
    dayIndex = dayIndex + 1
  }

  const pairIds = history.map(position => position.pair.id)

  // get all day datas where date is in this list, and pair is in pair list
  const {
    data: { pairDayDatas }
  } = await pairApi.getPairDayDataBulk(pairIds, startDateTimestamp)

  const formattedHistory: LiquidityChart[] = []

  // map of current pair => ownership %
  const ownershipPerPair: Record<string, OwnershipPair> = {}
  for (const index in dayTimestamps) {
    const dayTimestamp = dayTimestamps[index]
    const timestampCeiling = dayTimestamp + 86400

    // cycle through relevant positions and update ownership for any that we need to
    const relevantPositions = history.filter(snapshot => {
      return snapshot.timestamp < timestampCeiling && snapshot.timestamp > dayTimestamp
    })
    for (const index in relevantPositions) {
      const position = relevantPositions[index]
      // case where pair not added yet
      if (!ownershipPerPair[position.pair.id]) {
        ownershipPerPair[position.pair.id] = {
          lpTokenBalance: position.liquidityTokenBalance,
          timestamp: position.timestamp
        }
      }
      // case where more recent timestamp is found for pair
      if (ownershipPerPair[position.pair.id] && ownershipPerPair[position.pair.id].timestamp < position.timestamp) {
        ownershipPerPair[position.pair.id] = {
          lpTokenBalance: position.liquidityTokenBalance,
          timestamp: position.timestamp
        }
      }
    }

    const relavantDayDatas = Object.keys(ownershipPerPair).map(pairAddress => {
      // find last day data after timestamp update
      const dayDatasForThisPair = pairDayDatas.filter((dayData: any) => {
        return dayData.pairAddress === pairAddress
      })
      // find the most recent reference to pair liquidity data
      let mostRecent = dayDatasForThisPair[0]
      for (const index in dayDatasForThisPair) {
        const dayData = dayDatasForThisPair[index]
        if (dayData.date < dayTimestamp && dayData.date > mostRecent.date) {
          mostRecent = dayData
        }
      }
      return mostRecent
    })

    // now cycle through pair day datas, for each one find usd value = ownership[address] * reserveUSD
    const dailyUSD = relavantDayDatas.reduce((totalUSD, dayData) => {
      return (totalUSD =
        totalUSD +
        (ownershipPerPair[dayData.pairAddress]
          ? (parseFloat(ownershipPerPair[dayData.pairAddress].lpTokenBalance) / parseFloat(dayData.totalSupply)) *
            parseFloat(dayData.reserveUSD)
          : 0))
    }, 0)

    formattedHistory.push({
      date: dayTimestamp,
      valueUSD: dailyUSD
    })
  }

  return formattedHistory
}

export async function getUserPositions(
  account: string,
  price: number,
  snapshots: LiquiditySnapshot[]
): Promise<Position[]> {
  try {
    const result = await accountApi.getUserLiquidityPositions(account)
    if (result?.data?.liquidityPositions) {
      const formattedPositions = await Promise.all(
        result?.data?.liquidityPositions.map(async (positionData: any) => {
          const returnData = await getLPReturnsOnPair(account, positionData.pair, price, snapshots)
          return {
            ...positionData,
            ...returnData
          }
        })
      )
      return formattedPositions
    }
  } catch (e) {
    console.log(e)
  }
  return []
}
