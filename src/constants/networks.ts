import Mainnet from '../assets/networks/mainnet-network.svg'
import Polygon from '../assets/networks/polygon-network.png'
import BSC from '../assets/networks/bsc-network.png'
import AVAX from '../assets/networks/avax-network.png'
import Fantom from '../assets/networks/fantom-network.png'
import Cronos from '../assets/networks/cronos-network.png'
import Arbitrum from '../assets/networks/arbitrum-network.svg'
import BitTorrent from '../assets/networks/bittorrent-network.png'
import Velas from '../assets/networks/velas-network.png'
import Aurora from '../assets/networks/aurora-network.svg'
import Oasis from '../assets/networks/oasis-network.svg'
import Optimism from '../assets/networks/optimism-network.svg'
import ZkSync from '../assets/networks/zksync-network.png'

import EthereumLogo from '../assets/eth.png'
import MaticLogo from '../assets/polygon.png'
import BnbLogo from '../assets/bnb.png'
import AvaxLogo from '../assets/avax.png'
import FantomLogo from '../assets/networks/fantom-network.png'
import CronosLogo from '../assets/cronos.svg'
import BTTCLogo from '../assets/bttc.png'
import VelasLogo from '../assets/velas.png'
import AuroraLogo from '../assets/aurora.svg'
import OasisLogo from '../assets/oasis.svg'

export enum ChainId {
  MAINNET = 1,
  MATIC = 137,
  BSCMAINNET = 56,
  AVAXMAINNET = 43114,
  FANTOM = 250,
  CRONOS = 25,
  ARBITRUM = 42161,
  BTTC = 199,
  VELAS = 106,
  AURORA = 1313161554,
  OASIS = 42262,
  OPTIMISM = 10,
  ZKSYNC = 324,
}

export type NETWORK_INFO = {
  chainId: ChainId
  icon: string
  name: string
  urlKey: string
  priceRoute: string
  blockServiceRoute: string
  dmmSwapUrl: string
  subgraphName: string
  subgraphUrls: string[]
  subgraphBlockUrl: string
  etherscanUrl: string
  kncAddress: string
  wethAddress: string
  defaultStartTime: number
  nativeTokenSymbol: string
  nativeTokenWrappedName: string
  nativeTokenLogo: string
  etherscanLinkText: string
  tokensListUrl: string
  isEnableBlockService: boolean
}

export const NETWORKS_INFO: { [key in ChainId]: NETWORK_INFO } = {
  [ChainId.MAINNET]: {
    chainId: ChainId.MAINNET,
    icon: Mainnet,
    name: 'Ethereum',
    urlKey: 'ethereum',
    priceRoute: 'ethereum',
    blockServiceRoute: 'ethereum',
    dmmSwapUrl: 'https://kyberswap.com/',
    subgraphName: 'dynamic-amm/dynamic-amm',
    subgraphUrls: ['https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-exchange-ethereum'],
    subgraphBlockUrl: 'https://api.thegraph.com/subgraphs/name/dynamic-amm/ethereum-blocks-ethereum',
    etherscanUrl: 'https://etherscan.io',
    kncAddress: '0xdeFA4e8a7bcBA345F687a2f1456F5Edd9CE97202',
    wethAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    defaultStartTime: 1620201600,
    nativeTokenSymbol: 'ETH',
    nativeTokenWrappedName: 'Ether (Wrapped)',
    nativeTokenLogo: EthereumLogo,
    etherscanLinkText: 'Etherscan',
    tokensListUrl: 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/tokenLists/ethereum.tokenlist.json',
    isEnableBlockService: true,
  },
  [ChainId.MATIC]: {
    chainId: ChainId.MATIC,
    icon: Polygon,
    name: 'Polygon',
    urlKey: 'polygon',
    priceRoute: 'polygon',
    blockServiceRoute: 'polygon',
    dmmSwapUrl: 'https://kyberswap.com/',
    subgraphName: 'dynamic-amm/dmm-exchange-matic',
    subgraphUrls: [
      'https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-exchange-polygon',
      'https://polygon-subgraph.dmm.exchange/subgraphs/name/dynamic-amm/dmm-exchange-matic',
    ],
    subgraphBlockUrl: 'https://api.thegraph.com/subgraphs/name/dynamic-amm/ethereum-blocks-polygon',
    etherscanUrl: 'https://polygonscan.com',
    kncAddress: '0x1C954E8fe737F99f68Fa1CCda3e51ebDB291948C',
    wethAddress: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    defaultStartTime: 1625097600,
    nativeTokenSymbol: 'MATIC',
    nativeTokenWrappedName: 'Matic (Wrapped)',
    nativeTokenLogo: MaticLogo,
    etherscanLinkText: 'Polygonscan',
    tokensListUrl: 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/tokenLists/matic.tokenlist.json',
    isEnableBlockService: true,
  },
  [ChainId.BSCMAINNET]: {
    chainId: ChainId.BSCMAINNET,
    icon: BSC,
    name: 'BNB Chain',
    urlKey: 'bnb',
    priceRoute: 'bsc',
    blockServiceRoute: 'bsc',
    dmmSwapUrl: 'https://kyberswap.com/',
    subgraphName: 'kybernetwork/kyberswap-exchange-bsc',
    subgraphUrls: ['https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-exchange-bsc'],
    subgraphBlockUrl: 'https://api.thegraph.com/subgraphs/name/dynamic-amm/ethereum-blocks-bsc',
    etherscanUrl: 'https://bscscan.com',
    kncAddress: '0xfe56d5892bdffc7bf58f2e84be1b2c32d21c308b',
    wethAddress: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
    defaultStartTime: 1630313700,
    nativeTokenSymbol: 'BNB',
    nativeTokenWrappedName: 'BNB (Wrapped)',
    nativeTokenLogo: BnbLogo,
    etherscanLinkText: 'BscScan',
    tokensListUrl: 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/tokenLists/bsc.mainnet.tokenlist.json',
    isEnableBlockService: true,
  },
  [ChainId.AVAXMAINNET]: {
    chainId: ChainId.AVAXMAINNET,
    icon: AVAX,
    name: 'Avalanche',
    urlKey: 'avalanche',
    priceRoute: 'avalanche',
    blockServiceRoute: 'avalanche',
    dmmSwapUrl: 'https://kyberswap.com/',
    subgraphName: 'dynamic-amm/dmm-exchange-avax',
    subgraphUrls: [
      'https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-exchange-avalanche',
      'https://avax-subgraph.dmm.exchange/subgraphs/name/dynamic-amm/dmm-exchange-avax',
    ],
    subgraphBlockUrl: 'https://api.thegraph.com/subgraphs/name/ducquangkstn/avalache-blocks',
    etherscanUrl: 'https://snowtrace.io',
    kncAddress: '',
    wethAddress: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
    defaultStartTime: 1630431653,
    nativeTokenSymbol: 'AVAX',
    nativeTokenWrappedName: 'AVAX (Wrapped)',
    nativeTokenLogo: AvaxLogo,
    etherscanLinkText: 'Snowtrace',
    tokensListUrl: 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/tokenLists/avax.mainnet.tokenlist.json',
    isEnableBlockService: true,
  },
  [ChainId.FANTOM]: {
    chainId: ChainId.FANTOM,
    icon: Fantom,
    name: 'Fantom',
    urlKey: 'fantom',
    priceRoute: 'fantom',
    blockServiceRoute: 'fantom',
    dmmSwapUrl: 'https://kyberswap.com/',
    subgraphName: 'dynamic-amm/dmm-exchange-ftm',
    subgraphUrls: ['https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-exchange-fantom'],
    subgraphBlockUrl: 'https://api.thegraph.com/subgraphs/name/dynamic-amm/ethereum-blocks-fantom',
    etherscanUrl: 'https://ftmscan.com',
    kncAddress: '0x765277eebeca2e31912c9946eae1021199b39c61',
    wethAddress: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
    defaultStartTime: 1634290369,
    nativeTokenSymbol: 'FTM',
    nativeTokenWrappedName: 'FTM (Wrapped)',
    nativeTokenLogo: FantomLogo,
    etherscanLinkText: 'Ftmscan',
    tokensListUrl: 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/tokenLists/fantom.mainnet.tokenlist.json',
    isEnableBlockService: true,
  },
  [ChainId.CRONOS]: {
    chainId: ChainId.CRONOS,
    icon: Cronos,
    name: 'Cronos',
    urlKey: 'cronos',
    priceRoute: 'cronos',
    blockServiceRoute: 'cronos',
    dmmSwapUrl: 'https://kyberswap.com/',
    subgraphName: 'kyberswap/kyberswap-cronos',
    subgraphUrls: ['https://cronos-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-exchange-cronos'],
    subgraphBlockUrl: 'https://cronos-graph.kyberengineering.io/subgraphs/name/kybernetwork/cronos-blocks',
    etherscanUrl: 'https://cronos.crypto.org/explorer',
    kncAddress: '0x868fc5cb3367c4a43c350b85d5001acaf58a857e',
    wethAddress: '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23',
    defaultStartTime: 1638851256,
    nativeTokenSymbol: 'CRO',
    nativeTokenWrappedName: 'CRO (Wrapped)',
    nativeTokenLogo: CronosLogo,
    etherscanLinkText: 'Explorer',
    tokensListUrl: 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/tokenLists/cronos.tokenlist.json',
    isEnableBlockService: true,
  },
  [ChainId.ARBITRUM]: {
    chainId: ChainId.ARBITRUM,
    icon: Arbitrum,
    name: 'Arbitrum',
    urlKey: 'arbitrum',
    priceRoute: 'arbitrum',
    blockServiceRoute: 'arbitrum',
    dmmSwapUrl: 'https://kyberswap.com/',
    subgraphName: 'viet-nv/kyberswap-arbitrum',
    subgraphUrls: ['https://arbitrum-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-exchange-arbitrum'],
    subgraphBlockUrl: 'https://api.thegraph.com/subgraphs/name/viet-nv/arbitrum-blocks',
    etherscanUrl: 'https://arbiscan.io',
    kncAddress: '0x868fc5cb3367c4a43c350b85d5001acaf58a857e',
    wethAddress: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    defaultStartTime: 1644536463,
    nativeTokenSymbol: 'ETH',
    nativeTokenWrappedName: 'Ether (Wrapped)',
    nativeTokenLogo: EthereumLogo,
    etherscanLinkText: 'Arbiscan',
    tokensListUrl: 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/tokenLists/arbitrum.tokenlist.json',
    isEnableBlockService: true,
  },
  [ChainId.BTTC]: {
    chainId: ChainId.BTTC,
    icon: BitTorrent,
    name: 'BitTorrent',
    urlKey: 'bittorrent',
    priceRoute: 'bttc',
    blockServiceRoute: 'bttc',
    dmmSwapUrl: 'https://kyberswap.com/',
    subgraphName: 'dynamic-amm/kyberswap-bttc',
    subgraphUrls: ['https://bttc-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-exchange-bttc'],
    subgraphBlockUrl: 'https://bttc-graph.kyberengineering.io/subgraphs/name/kybernetwork/bttc-blocks',
    etherscanUrl: 'https://bttcscan.com',
    kncAddress: '0x868fc5cb3367c4a43c350b85d5001acaf58a857e',
    wethAddress: '0x8D193c6efa90BCFf940A98785d1Ce9D093d3DC8A',
    defaultStartTime: 1645007928,
    nativeTokenSymbol: 'BTT',
    nativeTokenWrappedName: 'BTT (Wrapped)',
    nativeTokenLogo: BTTCLogo,
    etherscanLinkText: 'Bttcscan',
    tokensListUrl: 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/tokenLists/bttc.tokenlist.json',
    isEnableBlockService: true,
  },
  [ChainId.VELAS]: {
    chainId: ChainId.VELAS,
    icon: Velas,
    name: 'Velas',
    urlKey: 'velas',
    priceRoute: 'velas',
    blockServiceRoute: 'velas',
    dmmSwapUrl: 'https://kyberswap.com/',
    subgraphName: 'kybernetwork/kyberswap-exchange-velas',
    subgraphUrls: ['https://velas-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-exchange-velas'],
    subgraphBlockUrl: 'https://velas-graph.kyberengineering.io/subgraphs/name/kybernetwork/velas-blocks',
    etherscanUrl: 'https://evmexplorer.velas.com',
    kncAddress: '0xfe56d5892bdffc7bf58f2e84be1b2c32d21c308b',
    wethAddress: '0xc579D1f3CF86749E05CD06f7ADe17856c2CE3126',
    defaultStartTime: 1630313700,
    nativeTokenSymbol: 'VLX',
    nativeTokenWrappedName: 'VLX (Wrapped)',
    nativeTokenLogo: VelasLogo,
    etherscanLinkText: 'Velas EVM Explorer',
    tokensListUrl: 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/tokenLists/velas.tokenlist.json',
    isEnableBlockService: false,
  },
  [ChainId.AURORA]: {
    chainId: ChainId.AURORA,
    icon: Aurora,
    name: 'Aurora',
    urlKey: 'aurora',
    priceRoute: 'aurora',
    blockServiceRoute: 'aurora',
    dmmSwapUrl: 'https://kyberswap.com/',
    subgraphName: 'piavgh/dmm-exchange-aurora',
    subgraphUrls: ['https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-exchange-aurora'],
    subgraphBlockUrl: 'https://aurora-graph.kyberengineering.io/subgraphs/name/kybernetwork/aurora-blocks',
    etherscanUrl: 'https://aurorascan.dev',
    kncAddress: '0xfe56d5892bdffc7bf58f2e84be1b2c32d21c308b',
    wethAddress: '0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB',
    defaultStartTime: 1630313700,
    nativeTokenSymbol: 'ETH',
    nativeTokenWrappedName: 'ETH (Wrapped)',
    nativeTokenLogo: AuroraLogo,
    etherscanLinkText: 'Aurora Explorer',
    tokensListUrl: 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/tokenLists/aurora.tokenlist.json',
    isEnableBlockService: false,
  },
  [ChainId.OASIS]: {
    chainId: ChainId.OASIS,
    icon: Oasis,
    name: 'Oasis',
    urlKey: 'oasis',
    priceRoute: 'oasis',
    blockServiceRoute: 'oasis',
    dmmSwapUrl: 'https://kyberswap.com/',
    subgraphName: 'kybernetwork/kyberswap-exchange-oasis',
    subgraphUrls: ['https://oasis-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-exchange-oasis'],
    subgraphBlockUrl: 'https://oasis-graph.kyberengineering.io/subgraphs/name/kybernetwork/oasis-blocks',
    etherscanUrl: 'https://explorer.emerald.oasis.dev',
    kncAddress: '0xfe56d5892bdffc7bf58f2e84be1b2c32d21c308b',
    wethAddress: '0x21C718C22D52d0F3a789b752D4c2fD5908a8A733',
    defaultStartTime: 1647932400,
    nativeTokenSymbol: 'ROSE',
    nativeTokenWrappedName: 'ROSE (Wrapped)',
    nativeTokenLogo: OasisLogo,
    etherscanLinkText: 'Oasis Emerald Explorer',
    tokensListUrl: 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/tokenLists/oasis.tokenlist.json',
    isEnableBlockService: true,
  },
  [ChainId.OPTIMISM]: {
    chainId: ChainId.OPTIMISM,
    icon: Optimism,
    name: 'Optimism',
    urlKey: 'optimism',
    priceRoute: 'optimism',
    blockServiceRoute: 'optimism',
    dmmSwapUrl: 'https://kyberswap.com/',
    subgraphName: 'kybernetwork/kyberswap-exchange-optimism',
    subgraphUrls: ['https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-exchange-optimism'],
    subgraphBlockUrl: 'https://api.thegraph.com/subgraphs/name/ianlapham/uni-testing-subgraph',
    etherscanUrl: 'https://optimistic.etherscan.io',
    kncAddress: '',
    wethAddress: '0x4200000000000000000000000000000000000006',
    defaultStartTime: 1655341071,
    nativeTokenSymbol: 'ETH',
    nativeTokenWrappedName: 'ETH (Wrapped)',
    nativeTokenLogo: EthereumLogo,
    etherscanLinkText: 'Optimistic Ethereum Explorer',
    tokensListUrl: 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/tokenLists/optimism.tokenlist.json',
    isEnableBlockService: true,
  },
  [ChainId.ZKSYNC]: {
    chainId: ChainId.ZKSYNC,
    icon: ZkSync,
    name: 'zkSync Era',
    urlKey: 'zksync',
    priceRoute: 'zksync',
    blockServiceRoute: 'zksync',
    dmmSwapUrl: 'https://kyberswap.com/',
    subgraphName: 'kybernetwork/kyberswap-exchange-zksync',
    subgraphUrls: ['https://zksync-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-exchange-zksync'],
    subgraphBlockUrl: 'https://zksync-graph.kyberengineering.io/subgraphs/name/kybernetwork/zksync-blocks',
    etherscanUrl: 'https://explorer.zksync.io',
    kncAddress: '',
    wethAddress: '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91',
    defaultStartTime: 1685083020,
    nativeTokenSymbol: 'ETH',
    nativeTokenWrappedName: 'ETH (Wrapped)',
    nativeTokenLogo: EthereumLogo,
    etherscanLinkText: 'zkSync Era Explorer',
    tokensListUrl: 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/tokenLists/zksync.tokenlist.json',
    isEnableBlockService: true,
  },
}

export const NETWORKS_INFO_LIST: NETWORK_INFO[] = Object.values(NETWORKS_INFO)
export const SUPPORTED_NETWORKS: ChainId[] = Object.keys(NETWORKS_INFO).map(Number)
export const NOT_SUPPORT_ELASTIC_NETWORKS: ChainId[] = [ChainId.AURORA, ChainId.ZKSYNC]
