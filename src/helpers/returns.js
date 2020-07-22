import { USER_MINTS_BUNRS_PER_PAIR, USER_HISTORY__PER_PAIR } from '../apollo/queries'
import { client } from '../apollo/client'

export const priceOverrides = [
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
  '0x6b175474e89094c44da98b954eedeac495271d0f' // DAI
]

async function getPrincipalForUserPerPair(user, pairAddress) {
  let usd = 0,
    amount0 = 0,
    amount1 = 0
  // get all minst and burns to get principal amounts
  const results = await client.query({
    query: USER_MINTS_BUNRS_PER_PAIR,
    variables: {
      user,
      pair: pairAddress
    }
  })
  for (const index in results.data.mints) {
    usd += parseFloat(results.data.mints[index].amountUSD) ?? 0
    amount0 += amount0 + parseFloat(results.data.mints[index].amount0) ?? 0
    amount1 += amount1 + parseFloat(results.data.mints[index].amount1) ?? 0
  }
  for (const index in results.data.burns) {
    usd -= parseFloat(results.data.burns[index].amountUSD) ?? 0
    amount0 -= parseFloat(results.data.burns[index].amount0) ?? 0
    amount1 -= parseFloat(results.data.burns[index].amount1) ?? 0
  }
  return { usd, amount0, amount1 }
}

export async function getLPReturnsOnPair(user, pair, ethPrice) {
  // initialize values
  const principal = await getPrincipalForUserPerPair(user, pair.id)
  let hodlReturn = 0
  let netReturn = 0

  // get snapshots of position changes on this pair for this user
  const {
    data: { liquidityPositionSnapshots: history }
  } = await client.query({
    query: USER_HISTORY__PER_PAIR,
    variables: {
      user,
      pair: pair.id
    }
  })

  // get data about the current position
  const currentPosition = {
    liquidityTokenBalance: history[history.length - 1].liquidityTokenBalance,
    liquidityTokenTotalSupply: pair.totalSupply,
    reserve0: pair.reserve0,
    reserve1: pair.reserve1,
    reserveUSD: pair.reserveUSD,
    token0PriceUSD: pair.token0.derivedETH * ethPrice,
    token1PriceUSD: pair.token1.derivedETH * ethPrice
  }

  for (const index in history) {
    // get positions at both bounds of the window
    let positionT0 = history[index]
    let positionT1 = parseInt(index) === history.length - 1 ? currentPosition : history[parseInt(index) + 1] || {}

    // hard code prices before launch to get better results for stablecoins and WETH
    if (positionT0.timestamp < 1589747086) {
      if (priceOverrides.includes(positionT0.pair.token0.id)) {
        positionT0.token0PriceUSD = 1
      }
      if (priceOverrides.includes(positionT0.pair.token1.id)) {
        positionT0.token1PriceUSD = 1
      }

      // WETH price
      if (positionT0.pair.token0.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
        positionT0.token0PriceUSD = 203
      }
      if (positionT0.pair.token1.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
        positionT0.token1PriceUSD = 203
      }
    }
    if (positionT1.timestamp < 1589747086) {
      if (priceOverrides.includes(positionT1.pair.token0.id)) {
        positionT1.token0PriceUSD = 1
      }
      if (priceOverrides.includes(positionT1.pair.token1.id)) {
        positionT1.token1PriceUSD = 1
      }
      // WETH price
      if (positionT1.pair.token0.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
        positionT1.token0PriceUSD = 203
      }
      if (positionT1.pair.token1.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
        positionT1.token1PriceUSD = 203
      }
    }

    // calculate ownership at ends of window, for end of window we need original LP token balance / new total supply
    const t0Ownership = parseFloat(positionT0.liquidityTokenBalance) / parseFloat(positionT0.liquidityTokenTotalSupply)
    const t1Ownership = parseFloat(positionT0.liquidityTokenBalance) / parseFloat(positionT1.liquidityTokenTotalSupply)

    // get starting amounts of token0 and token1 deposited by LP
    const token0_amount_t0 = t0Ownership * parseFloat(positionT0.reserve0)
    const token1_amount_t0 = t0Ownership * parseFloat(positionT0.reserve1)

    // // get current token values
    // const token0_amount_t1 = t1Ownership * parseFloat(positionT1.reserve0)
    // const token1_amount_t1 = t1Ownership * parseFloat(positionT1.reserve1)

    // // calculate squares to find imp loss and fee differences
    // const sqrK_t0 = Math.sqrt(token0_amount_t0 * token1_amount_t0)
    // const token0_amount_no_fees = sqrK_t0 * Math.sqrt(positionT1.token1PriceUSD)
    // const token1_amount_no_fees = sqrK_t0 / Math.sqrt(positionT1.token1PriceUSD)
    // const no_fees_usd =
    //   token0_amount_no_fees * positionT1.token0PriceUSD + token1_amount_no_fees * positionT1.token1PriceUSD

    // const difference_fees_token0 = token0_amount_t1 - token0_amount_no_fees
    // const difference_fees_token1 = token1_amount_t1 - token1_amount_no_fees
    // const difference_fees_usd =
    //   difference_fees_token0 * positionT1.token0PriceUSD + difference_fees_token1 * positionT1.token1PriceUSD

    // calculate USD value at t0 and t1 using initial token deposit amounts for asset return
    const assetValueT0 =
      token0_amount_t0 * parseFloat(positionT0.token0PriceUSD) +
      token1_amount_t0 * parseFloat(positionT0.token1PriceUSD)

    const assetValueT1 =
      token0_amount_t0 * parseFloat(positionT1.token0PriceUSD) +
      token1_amount_t0 * parseFloat(positionT1.token1PriceUSD)

    // const imp_loss_usd = no_fees_usd - assetValueT1
    // const uniswap_return = difference_fees_usd + imp_loss_usd

    // calculate value delta based on  prices_t1 - prices_t0 * token_amounts
    hodlReturn = hodlReturn ? hodlReturn + assetValueT1 - assetValueT0 : assetValueT1 - assetValueT0

    // get net value change for combined data
    const netValueT0 = t0Ownership * parseFloat(positionT0.reserveUSD)
    const netValueT1 = t1Ownership * parseFloat(positionT1.reserveUSD)
    netReturn = netReturn ? netReturn + netValueT1 - netValueT0 : netValueT1 - netValueT0
  }

  return {
    principal,
    hodl: {
      sum: principal.usd + hodlReturn, // change with multiple windows
      return: hodlReturn
    },
    net: {
      return: netReturn
    },
    uniswap: {
      return: netReturn - hodlReturn
    }
  }
}
