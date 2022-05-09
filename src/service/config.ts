import { SupportedNetwork } from 'constants/networks'

export default {
  [SupportedNetwork.ETHEREUM]: {
    clientUrl: 'https://api.thegraph.com/subgraphs/name/whiteswapfi/whiteswap',
    healthClientUrl: 'https://api.thegraph.com/index-node/graphql',
    stakingClientUrl: 'https://api.thegraph.com/subgraphs/name/way2rach/talisman',
    blockClientUrl: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks'
  },
  [SupportedNetwork.TRON]: {
    clientUrl: process.env.REACT_APP_TRON_API
  }
}
