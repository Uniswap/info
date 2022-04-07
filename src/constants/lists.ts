import { EthereumNetworkInfo, TronNetworkInfo } from './networks'

export const ETHEREUM_LIST = 'https://app.ws.exchange/assets/whiteswap-default.tokenlist.json'
export const TRON_LIST = 'https://app.ws.exchange/assets/whiteswap-tron-default.tokenlist.json'

export const DEFAULT_LIST_OF_LISTS = {
  [EthereumNetworkInfo.id]: [ETHEREUM_LIST],
  [TronNetworkInfo.id]: [TRON_LIST]
}
