import React from "react";
import { Box, Flex, Text } from "rebass";
import PropTypes from "prop-types";

import Link from "../Link";

import data from "./data";
import { urls } from "../../helpers";

const TransactionsList = ({ transactions }) => (
  <Box p={24}>
    {transactions.map(tx => (
      <Flex mb={24} justifyContent="space-between">
        <Link color="button" external href={urls.showTransaction(tx.tx)}>
          {tx.poolAdjustmentEth} ETH for {tx.poolAdjustmentToken} DAI
        </Link>
        <Text color="textDim">1 min ago</Text>
      </Flex>
    ))}
  </Box>
);

TransactionsList.defaultProps = {
  transactions: data
};

TransactionsList.propTypes = {
  transactions: PropTypes.array.isRequired
};

export default TransactionsList;
