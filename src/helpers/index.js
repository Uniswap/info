import axios from "axios";
import { BigNumber } from "bignumber.js";
import dayjs from "dayjs";
import Uniswap from "../constants/Uniswap";

BigNumber.set({ EXPONENTIAL_AT: 50 });

export const BASE_URL = "https://uniswap-analytics.appspot.com/api/";

export const tokenOptions = Object.keys(Uniswap.tokens).map(key => ({
  value: `${Uniswap.tokens[key].address}`,
  // label: `${key} - ${Uniswap.tokens[key].address}`
  label: key
}));

export const toK = num => (num > 999 ? `${num / 1000}K` : num);

export const Big = number => new BigNumber(number).dividedBy(1e18);

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

export async function retrieveExchangeTicker(
  exchangeData,
  tickerRetrievedCallback
) {
  var url = `${BASE_URL}v1/ticker?exchangeAddress=${
    exchangeData.exchangeAddress
  }`;

  console.log(
    `retrieving ticker for ${exchangeData.exchangeAddress} ...(${url})`
  );

  axios({
    method: "get",
    url: url
  }).then(response => {
    console.log(`received ticker for ${exchangeData.exchangeAddress}`);

    // update the values from the API response
    var responseData = response.data;

    // TODO convert value to eth using helper method?
    var tradeVolume = (responseData["tradeVolume"] / 1e18).toFixed(4);
    var ethLiquidity = (responseData["ethLiquidity"] / 1e18).toFixed(4);

    var priceChangePercent = (responseData["priceChangePercent"] * 100).toFixed(
      2
    );

    var erc20Liquidity = (
      responseData["erc20Liquidity"] / Math.pow(10, exchangeData.tokenDecimals)
    ).toFixed(4);

    exchangeData["tradeVolume"] = `${tradeVolume} ETH`;
    exchangeData["ethLiquidity"] = `${ethLiquidity} ETH`;

    exchangeData["erc20Liquidity"] = `${erc20Liquidity} ${exchangeData.symbol}`;

    if (priceChangePercent > 0) {
      exchangeData["percentChange"] = "+";
    } else {
      exchangeData["percentChange"] = "";
    }
    exchangeData["percentChange"] += priceChangePercent + "%";

    tickerRetrievedCallback();
  });
}

const buildDirectoryLabel = exchange => {
  const { symbol, exchangeAddress } = exchange;

  return {
    label: `${symbol} - ${exchangeAddress}`,
    value: exchangeAddress
  };
};

const buildDirectoryObject = exchange => {
  const { symbol, exchangeAddress, tokenAddress, tokenDecimals } = exchange;

  return {
    symbol,
    exchangeAddress,
    tokenAddress,
    tokenDecimals,
    tradeVolume: 0,
    percentChange: 0.0,
    ethLiquidity: 0,
    recentTransactions: [],
    chartData: [],
    userPoolTokens: 0,
    userPoolPercent: 0.0
  };
};

export async function retrieveExchangeDirectory(directoryRetrievedCallback) {
  // Load exchange list
  axios({
    method: "get",
    url: `${BASE_URL}v1/directory`
  }).then(response => {
    const directoryLabels = response.data.map(exchange =>
      buildDirectoryLabel(exchange)
    );

    let directoryObjects = {};
    response.data.forEach(exchange => {
      directoryObjects[exchange.exchangeAddress] = buildDirectoryObject(
        exchange
      );
    });

    // pass directoryLabels and directoryObjects arrays and objects to the callback
    directoryRetrievedCallback(directoryLabels, directoryObjects);
  });
}

export async function retrieveUserPoolShare(
  exchangeData,
  userAccount,
  poolShareRetrievedCallback
) {
  // TODO when we update to newer web3-react, check if we have a valid user account to query,
  // if not then just call pool_share_retrieved_callback() immediately
  axios({
    method: "get",
    url: `${BASE_URL}v1/user?exchangeAddress=${
      exchangeData.exchangeAddress
    }&userAddress=${userAccount}`
  }).then(response => {
    // update the values from the API response

    const { userNumPoolTokens, userPoolPercent } = response.data;

    exchangeData.userPoolTokens = Big(userNumPoolTokens).toFixed(4);
    exchangeData.userPoolPercent = (userPoolPercent * 100).toFixed(2);

    poolShareRetrievedCallback();
  });
}

// load exchange history for X days back
export async function retrieveExchangeHistory(
  exchangeData,
  daysToQuery,
  historyRetrievedCallback
) {
  // current time
  const utcEndTime = dayjs();

  // go back n days
  const utcStartTime = utcEndTime.subtract(daysToQuery, "day");

  var url = `${BASE_URL}v1/history?exchangeAddress=${
    exchangeData.exchangeAddress
  }&startTime=${utcStartTime.unix()}&endTime=${utcEndTime.unix()}`;

  console.log(`retrieving transaction history...(${url})`);

  axios({
    method: "get",
    url: url
  }).then(response => {
    processExchangeHistory(
      response,
      exchangeData,
      daysToQuery,
      historyRetrievedCallback
    );
  });
}

async function processExchangeHistory(
  response,
  exchangeData,
  daysToQuery,
  historyProcessedCallback
) {
  console.log(
    "received history (" +
      exchangeData.exchangeAddress +
      "), " +
      response.data.length +
      " tx"
  );

  var chartBucketDatas = {}; // chart data grouped by hour or day

  var chartBucketOrderedTimestamps = [];

  var monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];

  var nowUTC = new Date();

  var startUTCforBucket_seconds;
  var date;
  var bucketLabel;

  // TODO when daysToQuery <= 1 (each bucket will be an hour)
  // each bucket will be a day
  if (daysToQuery > 1 && daysToQuery <= 31) {
    // get the date for the very beginning of today's day (the recent most bucket)
    var startOfTodayUTC = new Date(
      Date.UTC(
        nowUTC.getUTCFullYear(),
        nowUTC.getUTCMonth(),
        nowUTC.getUTCDate()
      )
    );

    // buckets will be by day
    for (var daysBack = daysToQuery; daysBack >= 0; daysBack--) {
      startUTCforBucket_seconds =
        startOfTodayUTC.getTime() / 1000 - 60 * 60 * 24 * daysBack;

      date = new Date(startUTCforBucket_seconds * 1000);

      bucketLabel = `${monthNames[date.getUTCMonth()]} ${date.getUTCDate()}`;

      chartBucketOrderedTimestamps.push(startUTCforBucket_seconds);
      // put an empty data object in for this bucket
      chartBucketDatas[startUTCforBucket_seconds] = {
        tradeVolume: new BigNumber(0),
        curEthLiquidity: null,
        curTokenLiquidity: null,
        label: bucketLabel
      };
    }
  } else if (daysToQuery > 31) {
    // each bucket will be a month
    var startOfThisMonthUTC = new Date(
      Date.UTC(nowUTC.getFullYear(), nowUTC.getMonth())
    );

    // buckets will be by month
    for (var monthsBack = 0; monthsBack <= 11; monthsBack++) {
      startUTCforBucket_seconds = startOfThisMonthUTC.getTime() / 1000;

      date = new Date(startUTCforBucket_seconds * 1000);

      bucketLabel = `${monthNames[date.getUTCMonth()]}`;

      chartBucketOrderedTimestamps.splice(0, 0, startUTCforBucket_seconds);

      // put an empty data object in for this bucket
      chartBucketDatas[startUTCforBucket_seconds] = {
        tradeVolume: new BigNumber(0),
        curEthLiquidity: null,
        curTokenLiquidity: null,
        label: bucketLabel
      };

      // subtract a month
      startOfThisMonthUTC.setUTCMonth(startOfThisMonthUTC.getUTCMonth() - 1);
    }
  }

  response.data.forEach(transaction => {
    exchangeData.recentTransactions.push(transaction);

    var tx_timestamp = transaction["timestamp"];
    var tx_event = transaction["event"];

    var eth_amount = new BigNumber(transaction["ethAmount"]);
    var cur_eth_liquidity = new BigNumber(transaction["curEthLiquidity"]);

    // var token_amount = new BigNumber(transaction["tokenAmount"]);
    var cur_token_liquidity = new BigNumber(transaction["curTokenLiquidity"]);

    var bucket = null;

    for (var i = chartBucketOrderedTimestamps.length - 1; i >= 0; i--) {
      // if this tx timestamp is greater than or equal to a bucket's timestamp, it's in that bucket
      if (tx_timestamp >= chartBucketOrderedTimestamps[i]) {
        bucket = chartBucketDatas[chartBucketOrderedTimestamps[i]];
        break;
      }
    }

    // if this was a trading event, we can consider its volume
    if (tx_event === "EthPurchase" || tx_event === "TokenPurchase") {
      bucket.tradeVolume = bucket.tradeVolume.plus(eth_amount.absoluteValue());
    }

    // transactions are ordered from newest to oldest, so set it on the first time we encounter a null liquidity value for a bucket
    // update current eth liquidity for the bucket
    if (bucket.curEthLiquidity == null) {
      bucket.curEthLiquidity = cur_eth_liquidity;
    }

    // update current token liquidity for the bucket
    if (bucket.curTokenLiquidity == null) {
      bucket.curTokenLiquidity = cur_token_liquidity;
    }
  });

  // for buckets without any transactions, they can refer to the carry over values from the previous bucket
  // TODO this could be an issue for exchanges with long periods of no trades. Init thse to the current liquidity at a given date
  var curEthLiquidityCarryOver = new BigNumber(0);
  var curTokenLiquidityCarryOver = new BigNumber(0);

  var tokenDecimalExp = new BigNumber(10).exponentiatedBy(
    exchangeData.tokenDecimals
  );

  chartBucketOrderedTimestamps.forEach(timestamp => {
    // get the bucket data for this name
    var bucket = chartBucketDatas[timestamp];

    bucket.tradeVolume = bucket.tradeVolume.dividedBy(1e18);

    if (bucket.curEthLiquidity == null) {
      bucket.curEthLiquidity = curEthLiquidityCarryOver;
    } else {
      curEthLiquidityCarryOver = bucket.curEthLiquidity;
    }

    if (bucket.curTokenLiquidity == null) {
      bucket.curTokenLiquidity = curTokenLiquidityCarryOver;
    } else {
      curTokenLiquidityCarryOver = bucket.curTokenLiquidity;
    }

    var marginalRate = new BigNumber(0);

    if (bucket.curEthLiquidity.toFixed() !== 0) {
      marginalRate = bucket.curTokenLiquidity.dividedBy(bucket.curEthLiquidity);
    }

    // Data Object for Chart
    exchangeData.chartData.push({
      date: bucket.label,

      ethLiquidity: bucket.curEthLiquidity.dividedBy(1e18).toFixed(4),
      tokenLiquidity: bucket.curTokenLiquidity
        .dividedBy(tokenDecimalExp)
        .toFixed(4),

      volume: bucket.tradeVolume.toFixed(4),
      rate: marginalRate.toFixed(4)
    });
  });

  historyProcessedCallback();
}
