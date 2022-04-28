import { MINT_DETAILS, BURN_DETAILS, SWAP_DETAILS } from 'service/fragments'
import { gql } from 'apollo-boost'

export const FILTERED_TRANSACTIONS = gql`
  ${MINT_DETAILS}
  ${BURN_DETAILS}
  ${SWAP_DETAILS}
  query FilteredTransactions($allPairs: [Bytes]!) {
    mints(first: 20, where: { pair_in: $allPairs }, orderBy: timestamp, orderDirection: desc) {
      ...MintDetails
    }
    burns(first: 20, where: { pair_in: $allPairs }, orderBy: timestamp, orderDirection: desc) {
      ...BurnDetails
    }
    swaps(first: 30, where: { pair_in: $allPairs }, orderBy: timestamp, orderDirection: desc) {
      ...SwapDetails
    }
  }
`

export const GLOBAL_TXNS = gql`
  ${MINT_DETAILS}
  ${BURN_DETAILS}
  ${SWAP_DETAILS}
  query GlobalTransactions {
    transactions(first: 100, orderBy: timestamp, orderDirection: desc) {
      mints(orderBy: timestamp, orderDirection: desc) {
        ...MintDetails
      }
      burns(orderBy: timestamp, orderDirection: desc) {
        ...BurnDetails
      }
      swaps(orderBy: timestamp, orderDirection: desc) {
        ...SwapDetails
      }
    }
  }
`

export const USER_TRANSACTIONS = gql`
  ${MINT_DETAILS}
  ${BURN_DETAILS}
  ${SWAP_DETAILS}
  query Transactions($user: Bytes!) {
    mints(orderBy: timestamp, orderDirection: desc, where: { to: $user }) {
      ...MintDetails
    }
    burns(orderBy: timestamp, orderDirection: desc, where: { sender: $user }) {
      ...BurnDetails
    }
    swaps(orderBy: timestamp, orderDirection: desc, where: { to: $user }) {
      ...SwapDetails
    }
  }
`

export const USER_MINTS_BURNS_PER_PAIR = gql`
  query UserMintsBurnsPerPair($user: Bytes!, $pair: Bytes!) {
    mints(where: { to: $user, pair: $pair }) {
      amountUSD
      amount0
      amount1
      timestamp
      pair {
        token0 {
          id
        }
        token1 {
          id
        }
      }
    }
    burns(where: { sender: $user, pair: $pair }) {
      amountUSD
      amount0
      amount1
      timestamp
      pair {
        token0 {
          id
        }
        token1 {
          id
        }
      }
    }
  }
`
