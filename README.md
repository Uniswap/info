# Uniswap History

[![Netlify Status](https://api.netlify.com/api/v1/badges/fe433ca1-042b-40c1-890f-a92fd74ecc00/deploy-status)](https://app.netlify.com/sites/uniswap-info/deploys)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

**Note: This is the original version of [https://uniswap.info](https://uniswap.info). It is now hosted at [https://original.uniswap.info](https://original.uniswap.info).**

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
