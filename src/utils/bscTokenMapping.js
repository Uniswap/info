export const getBscTokenLogoURL = address => {
  let uri
  if (address?.toLowerCase() === '0xfe56d5892bdffc7bf58f2e84be1b2c32d21c308b') {
    //usdt
    address = '0xdeFA4e8a7bcBA345F687a2f1456F5Edd9CE97202'
    uri = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`
  } else if (address?.toLowerCase() === '0x339c72829ab7dd45c3c52f965e7abe358dd8761e') {
    // wana
    uri = 'https://assets.trustwalletapp.com/blockchains/smartchain/assets/0x339C72829AB7DD45C3C52f965E7ABe358dd8761E/logo.png'
  }
  if (!uri) {
    uri = `https://pancakeswap.finance/images/tokens/${address}.png`
  }

  return uri
}
