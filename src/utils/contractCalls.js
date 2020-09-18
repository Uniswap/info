import { AMM_FACTORY_ADDRESS, AMMFactoryAbi } from '../constants'
import { ethers } from 'ethers'

export const getAMMAddressForMarketShareToken = async (marketAddress, shareTokenAddress) => {
  const provider = ethers.getDefaultProvider('kovan') // TODO use flag
  const ammFactoryContract = new ethers.Contract(AMM_FACTORY_ADDRESS, AMMFactoryAbi, provider)

  const ammAddress = await ammFactoryContract.getAMM(marketAddress, shareTokenAddress)
  return ammAddress
}

export const checkIfDeployed = (token0, token1) => {
  // TODO
  return false
}
