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
elif [[ "$TRAVIS_BRANCH" == "main" ]]; then
  echo "Start running build"
  yarn build-production
  mkdir build-production-index
  cp build/index.html build-production-index
  mv build build-production
  echo "Finished running build"

  echo "Start running build"
  yarn build-matic
  mkdir build-matic-index
  cp build/index.html build-matic-index
  mv build build-matic
  echo "Finished running build"
else
    echo "Branch is not set for auto-build."
    exit 0
fi
