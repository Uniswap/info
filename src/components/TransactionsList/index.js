import React from "react";
import { Box, Flex, Text } from "rebass";
import PropTypes from "prop-types";
import dayjs from "dayjs";

import Link from "../Link";

import { urls } from "../../helpers";

import {
  TokenSwap,
  AddLiquidity,
  RemoveLiquidity
} from "./transactionTypeIcons";

const TransactionType = ({ event }) => {
  switch (event) {
    case "AddLiquidity":
      return <AddLiquidity />;
    case "RemoveLiquidity":
      return <RemoveLiquidity />;
    case "Token Swap":
      return <TokenSwap />;
    case "EthPurchase":
      return "Eth Purchase";
    case "TokenPurchase":
      return "Token Purchase";
    default:
      return null;
  }
};

const formatTime = unix => {
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
        {transaction.ethAmount} ETH for {transaction.tokenAmount} TOKEN
      </Link>
    </Flex>
    <Text color="textDim">{formatTime(transaction.timestamp)}</Text>
  </Flex>
);

const TransactionsList = ({ transactions }) => (
  <Box p={24}>
    {transactions.map((tx, index) => (
      <TransactionItem key={index} transaction={tx} />
    ))}
  </Box>
);

TransactionsList.defaultProps = {
  transactions: []
};

TransactionsList.propTypes = {
  transactions: PropTypes.array.isRequired
};

export default TransactionsList;
