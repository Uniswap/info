import { Container } from "unstated";

import { BASE_URL, Big } from "../helpers";

const buildDirectoryLabel = exchange => {
  const { symbol, exchangeAddress } = exchange;

  return {
    // label: `${symbol} - ${exchangeAddress}`,
    label: symbol,
    value: exchangeAddress
  };
};

const buildDirectoryObject = exchange => {
  const {
    name,
    symbol,
    exchangeAddress,
    tokenAddress,
    tokenDecimals,
    theme
  } = exchange;

  return {
    name,
    symbol,
    exchangeAddress,
    tokenAddress,
    tokenDecimals,
    tradeVolume: 0,
    percentChange: 0.0,
    theme,
    price: 0,
    invPrice: 0,
    ethLiquidity: 0,
    erc20Liquidity: 0
  };
};

export class DirectoryContainer extends Container {
  state = {
    directory: [],
    exchanges: []
  };

  async fetchDirectory() {
    try {
      const data = await fetch(`${BASE_URL}v1/directory`);

      if (!data.ok) {
        throw Error(data.status);
      }

      const json = await data.json();

      let directoryObjects = {};
      json.forEach(exchange => {
        directoryObjects[exchange.exchangeAddress] = buildDirectoryObject(
          exchange
        );
      });

      console.log(`fetched ${json.length} exchanges`);

      this.setState({
        directory: json.map(exchange => buildDirectoryLabel(exchange)),
        exchanges: directoryObjects
      });
    } catch (err) {
      console.log("error: ", err);
    }
  }

  async fetchTicker(exchangeAddress, decimals) {
    try {
      const data = await fetch(
        `${BASE_URL}v1/ticker?exchangeAddress=${exchangeAddress}`
      );

      if (!data.ok) {
        throw Error(data.status);
      }

      const json = await data.json();

      const {
        tradeVolume,
        ethLiquidity,
        priceChangePercent,
        erc20Liquidity,
        price,
        invPrice
      } = json;

      let percentChange = "";
      const adjustedPriceChangePercent = (priceChangePercent * 100).toFixed(2);

      adjustedPriceChangePercent > 0
        ? (percentChange = "+")
        : (percentChange = "");

      percentChange += adjustedPriceChangePercent;

      console.log(`fetched ticker for ${exchangeAddress}`);

      this.setState(prevState => ({
        exchanges: {
          ...prevState.exchanges,
          [exchangeAddress]: {
            ...prevState.exchanges[exchangeAddress],
            price,
            invPrice,
            percentChange,
            tradeVolume: Big(tradeVolume).toFixed(4),
            ethLiquidity: Big(ethLiquidity).toFixed(4),
            erc20Liquidity: (erc20Liquidity / Math.pow(10, decimals)).toFixed(4)
          }
        }
      }));
    } catch (err) {
      console.log("error: ", err);
    }
  }
}
