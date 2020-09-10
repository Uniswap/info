export const ASSETS_MAP = {
  BTC: {
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 8,
    txExplorer: 'https://blockstream.info/tx/',
    addressExplorer: 'https://blockstream.info/address/'
  },

  ETH: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
    txExplorer: 'https://etherscan.io/tx/',
    addressExplorer: 'https://etherscan.io/address/'
  },

  DAI: {
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    decimals: 18,
    txExplorer: 'https://etherscan.io/tx/',
    addressExplorer: 'https://etherscan.io/address/'
  },

  AE: {
    name: 'Aeternity',
    symbol: 'AE',
    decimals: 18,
    txExplorer: 'https://explorer.aepps.com/transactions/',
    addressExplorer: 'https://explorer.aeternity.io/account/transactions/',
    timestampMs: true // if timestamp is in milliseconds
  },

  // CAPT: {
  //   name: 'Captain Bitcoin',
  //   symbol: 'CAPT',
  //   decimals: 18,
  //   txExplorer: 'https://etherscan.io/tx/',
  //   addressExplorer: 'https://etherscan.io/address/'
  // },

  WBTC: {
    name: 'Wrapped BTC',
    symbol: 'WBTC',
    decimals: 8,
    txExplorer: 'https://etherscan.io/tx/',
    addressExplorer: 'https://etherscan.io/address/'
  },

  'BTC++': {
    name: 'BTC++',
    symbol: 'BTC++',
    decimals: 18,
    txExplorer: 'https://etherscan.io/tx/',
    addressExplorer: 'https://etherscan.io/address/'
  },

  USDC: {
    name: 'USDC Stablecoin',
    symbol: 'USDC',
    decimals: 6,
    txExplorer: 'https://etherscan.io/tx/',
    addressExplorer: 'https://etherscan.io/address/'
  },

  ONE: {
    name: 'Harmony One',
    symbol: 'ONE',
    decimals: 18,
    txExplorer: 'https://explorer.harmony.one/#/tx/',
    addressExplorer: 'https://explorer.harmony.one/#/address/'
  },

  MATIC: {
    name: 'Matic Network',
    symbol: 'MATIC',
    decimals: 18,
    txExplorer: 'https://explorer.matic.network/tx/',
    addressExplorer: 'https://explorer.matic.network/address/'
  }
}

export const ASSETS = Object.values(ASSETS_MAP)
