import { NetworkInfo, SupportedNetwork } from 'constants/networks'

export interface ApplicationState {
  timeKey: string
  latestBlock: number
  headBlock: number
  supportedTokens: {
    [SupportedNetwork.ETHEREUM]: Array<string>
    [SupportedNetwork.TRON]: Array<string>
  }
  activeNetwork: NetworkInfo
}
