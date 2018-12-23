# Uniswap History

Transaction and liquidity pool stats for http://uniswap.io

Check it out live: http://uniswap.info

### To Start Development

###### Installing dependency
```bash
npm i
```

###### Edit web3-eth-abi file

Follow [these instructions](https://github.com/ethereum/web3.js/issues/1916#issuecomment-427398031). This should only be temporary until a proper fix is found.

###### Running locally
```bash
npm start
```

# Loading Exchange Logs and Token Data

First run tools/crawl_exchange_logs.py passing in origin block and infura project id.
Then run tools/pull_exchanges.py after, passing in infura project id.

# TODO

- Improve mobile experience. (ie Trust browser)
- Implement time column.
