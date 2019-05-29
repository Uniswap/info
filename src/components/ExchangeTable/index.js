import React from "react";
import { Box, Flex, Text } from "rebass";
import PropTypes from "prop-types";
import styled from "styled-components";
import FourByFour from '../FourByFour'
import { Hint } from '../index'
import Panel from '../Panel'

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

const PoolSizeItem2 = ({ topTen }) => (
  <FourByFour
    p={24}
    alignItems="center" justifyContent='center'
    rounded bg="white"
    topLeft={<Hint color="text">Token</Hint>}
    width={1/3}
    bottomLeft={
      <Text
        color="uniswappink"
        className="-transition"
        fontSize={20}
        lineHeight={1.4}
        fontWeight={500}
      >
        {topTen.tokenName}
      </Text>
    }
    topRight={<Hint color="text">Total Liquidity In Eth</Hint>}
    bottomRight={
      <Text
        color="uniswappink"
        fontSize={20}
        lineHeight={1.4}
        fontWeight={500}
      >
        {topTen.tradeVolumeEth}
      </Text>
    }
  />
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
    {topTen.slice(0, 20).map((exchanges, index) => (
      <PoolSizeItem2 key={index} topTen={exchanges} />
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
