import { NetworkInfo, SupportedNetwork } from 'constants/networks'

export interface ApplicationState {
  currency: string
  timeKey: string
  sessionStart: number
  latestBlock: string
  headBlock: string
  supportedTokens: {
    [SupportedNetwork.ETHEREUM]: Array<string>
    [SupportedNetwork.TRON]: Array<string>
  }
  activeNetwork: NetworkInfo
}
