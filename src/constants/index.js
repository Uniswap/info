export const FACTORY_ADDRESS = process.env.REACT_APP_FACTORY_ADDRESS || '0x0639542a5cd99bd5f4e85f58cb1f61d8fbe32de9'

export const BUNDLE_ID = '1'

export const timeframeOptions = {
  FOUR_HOURS: '4 hours',
  ONE_DAY: '1 day',
  THERE_DAYS: '3 days',
  WEEK: '1 week',
  MONTH: '1 month',
  // THREE_MONTHS: '3 months',
  // YEAR: '1 year',
  ALL_TIME: 'All time',
}

// token list urls to fetch tokens from - use for warnings on tokens and pairs
export const SUPPORTED_LIST_URLS__NO_ENS =
  String(process.env.REACT_APP_CHAIN_ID) === '137'
    ? ['https://unpkg.com/quickswap-default-token-list@1.0.72/build/quickswap-default.tokenlist.json']
    : String(process.env.REACT_APP_CHAIN_ID) === '56'
    ? ['https://tokens.pancakeswap.finance/pancakeswap-extended.json']
    : String(process.env.REACT_APP_CHAIN_ID) === '43114'
    ? ['https://raw.githubusercontent.com/pangolindex/tokenlists/main/ab.tokenlist.json']
    : String(process.env.REACT_APP_CHAIN_ID === '250')
    ? ['https://raw.githubusercontent.com/SpookySwap/spooky-info/master/src/constants/token/spookyswap.json']
    : ['https://gateway.ipfs.io/ipns/tokens.uniswap.org']

// hide from overview list
export const OVERVIEW_TOKEN_BLACKLIST = [
  '0x495c7f3a713870f68f8b418b355c085dfdc412c3',
  '0xc3761eb917cd790b30dad99f6cc5b4ff93c4f9ea',
  '0xe31debd7abff90b06bca21010dd860d8701fd901',
  '0xfc989fbb6b3024de5ca0144dc23c18a063942ac1',
]

// pair blacklist
export const PAIR_BLACKLIST = ['0xb6a741f37d6e455ebcc9f17e2c16d0586c3f57a5']

/**
 * For tokens that cause erros on fee calculations
 */
export const FEE_WARNING_TOKENS = ['0xd46ba6d942050d489dbd938a2c909a5d5039a161']

export const ROPSTEN_TOKEN_LOGOS_MAPPING = {
  '0x8b4ddf9f13f382aff76d262f6c8c50e6d7961b94': '0xdefa4e8a7bcba345f687a2f1456f5edd9ce97202',
  '0x7b2810576aa1cce68f2b118cef1f36467c648f92': '0xdd974d5c2e2928dea5f71b9825b8b646686bd200',
  '0x068b43f7f2f2c6a662c36e201144ae45f7a1c040': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  '0x65bd1f48f1dd07bb285a3715c588f75684128ace': '0xdac17f958d2ee523a2206206994597c13d831ec7',
  '0xad6d458402f60fd3bd25163575031acdce07538d': '0x6b175474e89094c44da98b954eedeac495271d0f',
  '0x3dff0dce5fc4b367ec91d31de3837cf3840c8284': '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  '0xa748593dd74e5d0bb38a3f2f5090a0f31370c574': '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d',
  '0xb4f7332ed719eb4839f091eddb2a3ba309739521': '0x514910771af9ca656af840dff83e8264ecf986ca',
  '0xdb0040451f373949a4be60dcd7b6b8d6e42658b6': '0x0d8775f648430679a709e98d2b0cb6250d2887ef',
  '0x787e7339a52d7784a22146da7209c702e1e38511': '0xc00e94cb662c3520282e6f5717214004a7f26888',
  '0x5f4f41e067e8ccf0d1f9ee007223af4d72990cdc': '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
  '0xc778417e063141139fce010982780140aa0cd5ab': '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
}

export const WETH_ADDRESS = String(process.env.REACT_APP_WETH_ADDRESS) || '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'

export const KNC_ADDRESS = String(process.env.REACT_APP_KNC_ADDRESS) || '0xdeFA4e8a7bcBA345F687a2f1456F5Edd9CE97202'

export const KNCL_ADDRESS =
  String(process.env.REACT_APP_CHAIN_ID) === '1'
    ? '0xdd974D5C2e2928deA5F71b9825b8b646686BD200'
    : '0x7B2810576aa1cce68F2B118CeF1F36467c648F92'

export const ChainId = {
  MAINNET: 1,
  ROPSTEN: 3,
  MATIC: 137,
  MUMBAI: 80001,
  BSCTESTNET: 97,
  BSCMAINNET: 56,
  AVAXTESTNET: 43113,
  AVAXMAINNET: 43114,
  FANTOM: 250,
  CRONOSTESTNET: 338,
  CRONOS: 25,
  ARBITRUM_TESTNET: 421611,
  ARBITRUM: 42161,
  BTTC: 199,
  VELAS: 106,
  AURORA: 1313161554,
}

export const ANALYTICS_URLS = {
  1: 'https://analytics.kyberswap.com',
  137: 'https://polygon-analytics.kyberswap.com',
  56: 'https://bsc-analytics.kyberswap.com',
  43114: 'https://avax-analytics.kyberswap.com',
  250: 'https://fantom-analytics.kyberswap.com',
  25: 'https://cronos-analytics.kyberswap.com',
  [ChainId.ARBITRUM]: 'https://arbitrum-analytics.kyberswap.com',
  [ChainId.BTTC]: 'https://bttc-analytics.kyberswap.com',
  [ChainId.VELAS]: 'https://velas-analytics.kyberswap.com',
  [ChainId.AURORA]: 'https://aurora-analytics.kyberswap.com',
}

// This variable to handle crazy APR which it can be wrong calculations or a bug
// But now, for FOMO of Pagxy, updated this to 10000 (before we set 2000 for it)
export const MAX_ALLOW_APY = 10000

export const AMP_HINT =
  'Stands for amplification factor. Each pool can have its own AMP. Pools with a higher AMP provide higher capital efficiency within a particular price range'
