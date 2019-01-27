import React from "react";
import { Box, Flex, Text } from "rebass";
import PropTypes from "prop-types";
import styled from "styled-components";

import Link from "../Link";
import TransactionType from "./transactionTypeIcons";

import { urls, formatTime, Big } from "../../helpers";

const TransactionItem = ({ transaction, tokenSymbol }) => (
  <Flex mb={24} alignItems="center" justifyContent="space-between">
    <Flex alignItems="center">
      <TransactionType event={transaction.event} />
      <Link
        fontSize={[12, 16]}
        ml="3"
        color="button"
        external
        href={urls.showTransaction(transaction.tx)}
      >
        {Big(transaction.ethAmount).toFixed(4)} ETH for{" "}
        {Big(transaction.tokenAmount).toFixed(4)} {tokenSymbol}
      </Link>
    </Flex>
    <Text fontSize={[12, 16]} color="textDim">
      {formatTime(transaction.timestamp)}
    </Text>
  </Flex>
);

const List = styled(Box)`
  height: 300px;
  max-height: 300px;
  overflow-y: scroll;
`;

// @TODO rework into virtualized list
const TransactionsList = ({ transactions, tokenSymbol }) => (
  <List p={24}>
    {transactions.slice(0, 20).map((tx, index) => (
      <TransactionItem key={index} transaction={tx} tokenSymbol={tokenSymbol} />
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
