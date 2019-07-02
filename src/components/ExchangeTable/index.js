import React from 'react'
import { Box, Text } from 'rebass'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import FourByFour from '../FourByFour'
import { Divider, Hint, Address } from '../index'
import Loader from '../Loader'
import TokenLogo from '../TokenLogo'

const options = { hour: 'numeric', minute: 'numeric', second: 'numeric' }

const now = new Date()

const FirstExchangeItem = () => (
  <FourByFour
    p={24}
    rounded
    bg="white"
    bottomLeft={
      <Hint color="text" fontSize={15} fontWeight={500} mb={40}>
        Token
      </Hint>
    }
    bottomRight={
      <Hint color="text" fontSize={15} fontWeight={500} mb={40}>
        24 Hour Volume ETH
      </Hint>
    }
    topRight={
      <Hint color="text" fontSize={12} fontWeight={500} mb={40}>
        Last Updated: {now.toLocaleDateString(undefined, options)}
      </Hint>
    }
  />
)

const Flex = styled.div`
  display: flex;
  align-items: center;
`

const InlineText = styled(Text)`
  display: inline;
  vertical-align: middle;
`

const StyledTokenLogo = styled(TokenLogo)`
  margin-right: 0.25rem;
`

function ExchangeItem({ topN }) {
  return (
    <Box>
      <FourByFour
        p={24}
        rounded
        bg="white"
        bottomLeft={
          <>
            <Flex>
              <StyledTokenLogo address={topN.tokenAddress} />
              <InlineText color="uniswappink" className="-transition" fontSize={20} fontWeight={250}>
                {topN.tokenName}
              </InlineText>
            </Flex>
            <Text color="uniswappink" className="-transition" fontSize={12} fontWeight={200}>
              <Address address={topN.tokenAddress} token="true" />
            </Text>
          </>
        }
        bottomRight={
          <Text color="uniswappink" fontSize={20} fontWeight={250}>
            {topN.tradeVolumeEth}
          </Text>
        }
      />
      <Divider />
    </Box>
  )
}

const List = styled(Box)`
  height: 700px;
  max-height: 700px;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
`

// @TODO rework into virtualized list
const TopExchanges = ({ topN }) => {
  if (topN.length === 0) {
    return <Loader />
  } else {
    return (
      <List p={24} style={{ height: 'unset', maxHeight: 'unset' }}>
        <FirstExchangeItem />
        <Divider />
        {topN.map((exchanges, index) => (
          <ExchangeItem key={index} topN={exchanges} />
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
