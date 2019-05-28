import { BigNumber } from "bignumber.js";
import dayjs from "dayjs";
import Uniswap from "../constants/Uniswap";

BigNumber.set({ EXPONENTIAL_AT: 50 });

export const BASE_URL = "https://uniswap-api-staging.loanscan.io/";

export const tokenOptions = Object.keys(Uniswap.tokens).map(key => ({
  value: `${Uniswap.tokens[key].address}`,  
  // label: `${key} - ${Uniswap.tokens[key].address}`
  label: key
}));

export const toNiceDate = date => dayjs(date).format("MMM DD");

export const toNiceDateYear = date => dayjs(date).format("MMMM DD, YYYY");

export const isWeb3Available = async () => {
  /* eslint-disable */
  if (typeof window.ethereum !== "undefined") {
    window.web3 = new Web3(ethereum);
    try {
      await ethereum.enable();
      return true;
    } catch (error) {
      return false;
    }
  } else if (typeof window.web3 !== "undefined") {
    window.web3 = new Web3(web3.currentProvider);
    return true;
  } else {
    return false;
  }
  /* eslint-enable */
};

export const toK = (num, fixed) => {
  const formatter = divideBy =>
    fixed === true ? Number(num / divideBy).toFixed(4) : Number(num / divideBy);

  if (num > 999999 || num < -999999) {
    return `${formatter(1000000)}M`;
  } else if (num > 999 || num < -999) {
    return `${formatter(1000)}K`;
  } else {
    return formatter(1);
  }
};

export const setThemeColor = theme =>
  document.documentElement.style.setProperty("--c-token", theme || "#333333");

export const Big = number => new BigNumber(number);

export const urls = {
  showTransaction: tx => `https://etherscan.io/tx/${tx}/`,
  showAddress: address => `https://www.etherscan.io/address/${address}/`,
  showBlock: block => `https://etherscan.io/block/${block}/`
};

export const formatTime = unix => {
  const now = dayjs();
  const timestamp = dayjs.unix(unix);

  const inSeconds = now.diff(timestamp, "second");
  const inMinutes = now.diff(timestamp, "minute");
  const inHours = now.diff(timestamp, "hour");
  const inDays = now.diff(timestamp, "day");

  if (inHours >= 24) {
    return `${inDays} ${inDays === 1 ? "day" : "days"} ago`;
  } else if (inMinutes >= 60) {
    return `${inHours} ${inHours === 1 ? "hour" : "hours"} ago`;
  } else if (inSeconds >= 60) {
    return `${inMinutes} ${inMinutes === 1 ? "minute" : "minutes"} ago`;
  } else {
    return `${inSeconds} ${inSeconds === 1 ? "second" : "seconds"} ago`;
  }
};

export const formatNumber = (num) => {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}