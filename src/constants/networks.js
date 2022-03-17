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
import { ChainId } from '.'

export const NETWORK_ICON = {
  [ChainId.MAINNET]: Mainnet,
  [ChainId.ROPSTEN]: Mainnet,
  [ChainId.MATIC]: Polygon,
  [ChainId.MUMBAI]: Polygon,
  [ChainId.BSCMAINNET]: BSC,
  [ChainId.BSCTESTNET]: BSC,
  [ChainId.AVAXMAINNET]: AVAX,
  [ChainId.AVAXTESTNET]: AVAX,
  [ChainId.FANTOM]: Fantom,
  [ChainId.CRONOS]: Cronos,
  [ChainId.CRONOSTESTNET]: Cronos,
  [ChainId.ARBITRUM]: Arbitrum,
  [ChainId.BTTC]: BitTorrent,
  [ChainId.VELAS]: Velas,
  [ChainId.AURORA]: Aurora,
}
