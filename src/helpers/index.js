import Uniswap from "../constants/Uniswap";

export const tokenOptions = Object.keys(Uniswap.tokens).map(key => {
  return {
    value: key,
    // label: `${key} - ${Uniswap.tokens[key].address}`
    label: key
  };
});
