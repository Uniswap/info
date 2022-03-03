#!/bin/bash

set -uo pipefail

printf 'Building swap from commit %s\n' "$TRAVIS_COMMIT"
if [[ "$TRAVIS_BRANCH" == "develop" ]]; then
  echo "Start running build"
  yarn build-ropsten
  mv build build-ropsten
  echo "Finished running build-ropsten"
  yarn build-mumbai
  mv build build-mumbai
  echo "Finished running build-ropsten"
elif [[ "$TRAVIS_BRANCH" == "staging" ]]; then
  echo "Start running build"
  yarn build-staging
  mv build build-staging
  echo "Finished running build-eth-staging"

  yarn build-matic-staging
  mv build build-matic-staging
  echo "Finished running matic-staging"

  yarn build-bsc-staging
  mv build build-bsc-staging
  echo "Finished running matic-staging"

  echo "Start build fantom-staging"
  yarn build-fantom-staging
  mv build build-fantom-staging
  echo "Finished running fantom-staging"
elif [[ "$TRAVIS_BRANCH" == "main" ]]; then
  echo "Start running build"
  yarn build-production
  mkdir build-production-index
  mv build/index.html build-production-index
  mv build build-production
  echo "Finished running build"

  echo "Start running build"
  yarn build-matic
  mkdir build-matic-index
  mv build/index.html build-matic-index
  mv build build-matic
  echo "Finished running build"

  echo "Start running build"
  yarn build-bsc
  mkdir build-bsc-index
  mv build/index.html build-bsc-index
  mv build build-bsc
  echo "Finished running build"

  echo "Start running build"
  yarn build-avax
  mkdir build-avax-index
  mv build/index.html build-avax-index
  mv build build-avax
  echo "Finished running build"

  echo "Start running build"
  yarn build-fantom
  mkdir build-fantom-index
  mv build/index.html build-fantom-index
  mv build build-fantom
  echo "Finished running build"

  echo "Start running build"
  yarn build-cronos
  mkdir build-cronos-index
  mv build/index.html build-cronos-index
  mv build build-cronos
  echo "Finished running build"

  echo "Start running build arbitrum"
  yarn build-arbitrum
  mkdir build-arbitrum-index
  cp build/index.html build-arbitrum-index
  mv build build-arbitrum
  echo "Finished running build"
else
    echo "Branch is not set for auto-build."
    exit 0
fi
