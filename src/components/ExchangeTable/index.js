import React from 'react'
import { Box, Text } from 'rebass'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import FourByFour from '../FourByFour'
import { Divider, Hint } from '../index'
import Loader from '../Loader'

const FirstExchangeItem = ({ topTen }) => (
  <FourByFour
    p={24}
    rounded bg="white"
    topLeft={
      <Hint
        color="text"
        fontSize={15}
        fontWeight={500}
        mb={40}
      >
        Token
      </Hint>}
    bottomLeft={
      <Text
        color="uniswappink"
        className="-transition"
        fontSize={20}
        lineHeight={0.15}
        fontWeight={250}
      >
        {topTen[0].tokenName}
      </Text>
    }
    topRight={
      <Hint
        color="text"
        fontSize={15}
        fontWeight={500}
        mb={40}
      >
        24 Hour Volume ETH
      </Hint>}
    bottomRight={
      <Text
        color="uniswappink"
        fontSize={20}
        lineHeight={0.15}
        fontWeight={250}
      >
        {topTen[0].tradeVolumeEth}
      </Text>
    }
  />
)

const ExchangeItem = ({ topTen }) => (
  <Box>
    <FourByFour
      p={24}
      rounded bg="white"
      bottomLeft={
        <Text
          color="uniswappink"
          className="-transition"
          fontSize={20}
          lineHeight={0.15}
          fontWeight={250}
        >
          {topTen.tokenName}
        </Text>
      }
      bottomRight={
        <Text
          color="uniswappink"
          fontSize={20}
          lineHeight={0.15}
          fontWeight={250}
        >
          {topTen.tradeVolumeEth}
        </Text>
      }
    />

    <Divider/>
  </Box>
)

const List = styled(Box)`
  height: 700px;
  max-height: 700px;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
`

// @TODO rework into virtualized list
const TopExchanges = ({ topTen }) => {
  if (topTen.length == 0) {
    return (
      <Loader/>
    )
  } else {
    console.log("GHAGF", topTen.slice(0,1))
    return (
      <List p={24}>
        <FirstExchangeItem topTen={topTen.slice(0, 1)}/>
        <Divider/>
        {topTen.slice(1, 10).map((exchanges, index) => (
          <ExchangeItem key={index} topTen={exchanges}/>
        ))}
      </List>
    )
  }
}

TopExchanges.defaultProps = {
  transactions: []
}

TopExchanges.propTypes = {
  transactions: PropTypes.array.isRequired
}

export default TopExchanges
