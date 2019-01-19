import Uniswap from "../constants/Uniswap";

export const tokenOptions = Object.keys(Uniswap.tokens).map(key => {
  return {
    value: `${Uniswap.tokens[key].address}`,
    // label: `${key} - ${Uniswap.tokens[key].address}`
    label: key
  };
});

export const urls = {
  showTransaction: tx => `https://etherscan.io/tx/${tx}/`,
  showAddress: address => `https://www.etherscan.io/address/${address}/`,
  showBlock: block => `https://etherscan.io/block/${block}/`
};
