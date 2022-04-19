/// <reference types="react-scripts" />

declare enum SupportedNetwork {
  ETHEREUM = 'eth',
  TRON = 'trx'
}

type ParamsWithNetwork<T = unknown> = T & {
  networkId: SupportedNetwork
}
