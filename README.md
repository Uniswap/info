# Uniswap History

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

**Note: This is the original version of [https://uniswap.io](https://uniswap.io); it now is hosted at [https://original.uniswap.info](https://original.uniswap.info).**

### To Start Development

###### Installing dependencies
```bash
yarn
```

###### Running locally
```bash
yarn start
```

# Loading Exchange Logs and Token Data

First run tools/crawl_exchange_logs.py passing in origin block and infura project id.
Then run tools/pull_exchanges.py after, passing in infura project id.

# TODO

- Improve mobile experience. (ie Trust browser)
- Implement time column.
