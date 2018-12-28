# Uniswap History

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Transaction and liquidity pool stats for https://uniswap.io

Check it out live: https://uniswap.info

### To Start Development

###### Installing dependency
```bash
npm i
```

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
