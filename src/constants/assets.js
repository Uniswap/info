const assets = {
  BTC: {
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 8,
    explorer: 'https://blockstream.info/tx/'
  },

  ETH: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
    explorer: 'https://etherscan.io/tx/'
  },

  DAI: {
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    decimals: 18,
    explorer: 'https://etherscan.io/tx/'
  },

  AE: {
    name: 'Aeternity',
    symbol: 'AE',
    decimals: 18,
    explorer: 'https://explorer.aepps.com/transactions/',
    timestampMs: true // if timestamp is in milliseconds
  },

  CAPT: {
    name: 'CAPT',
    decimals: 18,
    explorer: 'https://etherscan.io/tx/'
  },

  WBTC: {
    name: 'Wrapped BTC',
    symbol: 'WBTC',
    decimals: 8,
    explorer: 'https://etherscan.io/tx/'
  },

  'BTC++': {
    name: 'BTC++',
    decimals: 18,
    explorer: 'https://etherscan.io/tx/'
  },

  USDC: {
    name: 'USDC Stablecoin',
    symbol: 'USDC',
    decimals: 6,
    explorer: 'https://etherscan.io/tx/'
  },

  ONE: {
    name: 'Harmony One',
    symbol: 'ONE',
    decimals: 18,
    explorer: 'https://explorer.harmony.one/#/tx/'
  },

  MATIC: {
    name: 'Matic Network',
    symbol: 'MATIC',
    decimals: 18,
    explorer: 'https://explorer.matic.network/tx/'
  }
}

export const ASSETS = Object.values(assets)
