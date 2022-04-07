import TRON_LOGO_URL from '../assets/tron.svg'
import ETHEREUM_LOGO_URL from '../assets/eth.png'

export enum SupportedNetwork {
  ETHEREUM = 'eth',
  TRON = 'trx'
}

export interface NetworkInfo {
  id: SupportedNetwork
  route: string
  name: string
  imageURL: string
  bgColor: string
  primaryColor: string
  secondaryColor: string
  blurb?: string
}

export const EthereumNetworkInfo: NetworkInfo = {
  id: SupportedNetwork.ETHEREUM,
  route: 'eth',
  name: 'Ethereum',
  imageURL: ETHEREUM_LOGO_URL,
  bgColor: '#fc077d',
  primaryColor: '#fc077d',
  secondaryColor: '#2172E5'
}

export const TronNetworkInfo: NetworkInfo = {
  id: SupportedNetwork.TRON,
  route: 'trx',
  name: 'Tron',
  imageURL: TRON_LOGO_URL,
  bgColor: '#0A294B',
  primaryColor: '#0490ED',
  secondaryColor: '#96BEDC',
  blurb: 'Beta'
}

export const SUPPORTED_NETWORK_VERSIONS: NetworkInfo[] = [EthereumNetworkInfo, TronNetworkInfo]
