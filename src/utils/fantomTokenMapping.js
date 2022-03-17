import { isAddress } from '.'

export const getFantomTokenLogoURL = address => {
  return `https://raw.githubusercontent.com/sushiswap/logos/main/network/fantom/${isAddress(address)}.jpg`
}
