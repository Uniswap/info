import React from "react";
import { Box, Flex, Text } from "rebass";
import PropTypes from "prop-types";
import styled from "styled-components";

import Link from "../Link";

import { urls, formatTime, Big } from "../../helpers";

// TODO - gonna have to query top twenty exchanges, and then all their histories from 20 pages ago
// Might shrink it down to 10 if the query is too long

const PoolSizeItem = ({ topTen }) => (
  <Flex  mb={24} alignItems="center" justifyContent='center'>
    <Flex alignItems="center" pr={24}>
        {topTen.tokenName}
    </Flex>
    <Text fontSize={[12, 16]}>
      Total Liquidty in ETH: {topTen.tradeVolumeEth}
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
const PoolSizeList = ({ topTen }) => (
  <List p={24}>
    {topTen.slice(0, 10).map((exchanges, index) => (
      <PoolSizeItem key={index} topTen={exchanges} />
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
