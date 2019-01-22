import React from "react";
import { Box, Flex, Text } from "rebass";
import PropTypes from "prop-types";
import styled from "styled-components";
import { BigNumber } from "bignumber.js";

import Link from "../Link";

import { urls, formatTime } from "../../helpers";

import {
  TokenSwap,
  AddLiquidity,
  RemoveLiquidity
} from "./transactionTypeIcons";

BigNumber.set({ EXPONENTIAL_AT: 50 });

const Big = number => new BigNumber(number).dividedBy(1e18);

const TransactionType = ({ event }) => {
  switch (event) {
    case "AddLiquidity":
      return <AddLiquidity />;
    case "RemoveLiquidity":
      return <RemoveLiquidity />;
    case "Token Swap":
      return <TokenSwap />;
    case "EthPurchase":
      return <TokenSwap />;
    case "TokenPurchase":
      return <TokenSwap />;
    default:
      return null;
  }
};

const TransactionItem = ({ transaction }) => (
  <Flex mb={24} justifyContent="space-between">
    <Flex alignItems="center">
      <TransactionType event={transaction.event} />
      <Link
        ml="3"
        color="button"
        external
        href={urls.showTransaction(transaction.tx)}
      >
        {Big(transaction.ethAmount).toFixed(4)} ETH for{" "}
        {Big(transaction.tokenAmount).toFixed(4)} "TOKEN"
      </Link>
    </Flex>
    <Text color="textDim">{formatTime(transaction.timestamp)}</Text>
  </Flex>
);

const List = styled(Box)`
  height: 300px;
  max-height: 300px;
  overflow-y: scroll;
`;

const TransactionsList = ({ transactions }) => (
  <List p={24}>
    {transactions.map((tx, index) => (
      <TransactionItem key={index} transaction={tx} />
    ))}
  </List>
);

TransactionsList.defaultProps = {
  transactions: []
};

TransactionsList.propTypes = {
  transactions: PropTypes.array.isRequired
};

export default TransactionsList;
