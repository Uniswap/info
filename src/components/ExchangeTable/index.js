import React from "react";
import { Box, Flex, Text } from "rebass";
import PropTypes from "prop-types";
import styled from "styled-components";

import Link from "../Link";

import { urls, formatTime, Big } from "../../helpers";

// TODO - gonna have to query top twenty exchanges, and then all their histories from 20 pages ago
// Might shrink it down to 10 if the query is too long

const PoolSizeItem = ({ transaction, tokenSymbol }) => (
  <Flex  mb={24} alignItems="center" justifyContent='center'>
    <Flex alignItems="center" pr={24}>
        Pool Name Here: TODO
    </Flex>
    <Text fontSize={[12, 16]}>
      Total Liquidty in ETH: [TODO]
    </Text>
  </Flex>
);

const List = styled(Box)`
  height: 700px;
  max-height: 700px;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
`;

// @TODO rework into virtualized list
const PoolSizeList = ({ transactions, tokenSymbol }) => (
  <List p={24}>
    {transactions.slice(0, 20).map((tx, index) => (
      <PoolSizeItem key={index} transaction={tx} tokenSymbol={tokenSymbol} />
    ))}
  </List>
);

PoolSizeList.defaultProps = {
  transactions: []
};

PoolSizeList.propTypes = {
  transactions: PropTypes.array.isRequired
};

export default PoolSizeList;
