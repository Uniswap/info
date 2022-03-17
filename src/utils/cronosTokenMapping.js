import { isAddress } from './index.js'

export const getCronosTokenLogoURL = address => {
  let uri

  if (!uri) {
    uri = `https://vvs.finance/images/tokens/${isAddress(address)}.svg`
  }

  return uri
}
