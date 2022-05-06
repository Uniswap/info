export const UserHistoryMock = [
  {
    timestamp: 1647354226,
    reserveUSD: '48638.00691716882881628117440734763',
    liquidityTokenBalance: '0.000062112314150737',
    liquidityTokenTotalSupply: '0.000062802119300004',
    reserve0: '9.605504826207720536',
    reserve1: '24662.953758',
    token0PriceUSD: '2531.777756462345477929943766308096',
    token1PriceUSD: '0.9860539697397754983107967437674589',
    pair: {
      id: '0xa029a744b4e44e22f68a1bb9a848caafbf6bb233',
      reserve0: '9.266108317973354039',
      reserve1: '25708.635871',
      reserveUSD: '51481.78070956633144714465392160739',
      token0: {
        id: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        __typename: 'Token'
      },
      token1: {
        id: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        __typename: 'Token'
      },
      __typename: 'Pair'
    },
    __typename: 'LiquidityPositionSnapshot'
  }
]
export const UserLiquidityChartMock = [
  {
    date: 1647354226,
    valueUSD: 0
  },
  {
    date: 1647440626,
    valueUSD: 0
  }
]
export const UserPositionsMock = [
  {
    pair: {
      id: '0xa029a744b4e44e22f68a1bb9a848caafbf6bb233',
      reserve0: '9.266108317973354039',
      reserve1: '25708.635871',
      reserveUSD: '51481.78070956633144714465392160739',
      token0: {
        id: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        symbol: 'WETH',
        derivedETH: '1',
        __typename: 'Token'
      },
      token1: {
        id: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        symbol: 'USDT',
        derivedETH: '0.0003604278486213172301770472261865271',
        __typename: 'Token'
      },
      totalSupply: '0.000062912561080272',
      __typename: 'Pair'
    },
    liquidityTokenBalance: '0.000062112314150737',
    __typename: 'LiquidityPosition',
    feeEarned: 51.760385618796036
  }
]
export const TopLpsMock = [
  {
    user: {
      id: '0xb41c0bf57b94fc923940868f66e77e78d546af30',
      __typename: 'User'
    },
    pairName: 'ETH-USDT',
    pairAddress: '0xa029a744b4e44e22f68a1bb9a848caafbf6bb233',
    token0: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    token1: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    usd: 50826.93315237885
  },
  {
    user: {
      id: '0x263a8b92d21749a3f8df2d507abec129793f041d',
      __typename: 'User'
    },
    pairName: 'WSD-USDT',
    pairAddress: '0x8b40ca14faf036125bea70fdbd59601115b2e597',
    token0: '0x0423d7c27d1dde7eb4aae02dae6b651c7225e6f9',
    token1: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    usd: 36573.90528778785
  }
]
