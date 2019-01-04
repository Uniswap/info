/**
 * @prettier
 */

import React from "react";
import styled from "styled-components";
import { Box, Button, Flex, Text, Image } from "rebass";

import Wrapper from "./components/Theme";
import Title from "./components/Title";
import FourByFour from "./components/FourByFour";
import Panel from "./components/Panel";
import Dashboard from "./components/Dashboard";

const Header = styled(Panel)`
  display: grid;
  grid-template-columns: 1fr 200px;
  align-items: center;
`;

const Divider = styled(Box)`
  height: 1px;
  background-color: rgba(43, 43, 43, 0.05);
`;

const Hint = props => (
  <Text {...props} fontSize={12}>
    {props.children}
  </Text>
);

const App = () => (
  <Wrapper>
    <Header
      px={24}
      py={3}
      bg={["mineshaft", "transparent"]}
      color={["white", "black"]}
    >
      <Title />
      <Box bg="uniswappink">
        <code>Main Dropdown</code>
      </Box>
    </Header>

    <Dashboard mx="auto" px={[0, 3]}>
      <Panel rounded color="white" bg="jaguar" p={24} area="volume">
        <FourByFour
          topLeft={<Hint color="textLightDim">DAI Volume</Hint>}
          bottomLeft={
            <Text fontSize={24} lineHeight={1.4} fontWeight={500}>
              130.83 ETH
            </Text>
          }
          topRight={<Hint color="textLightDim">24h</Hint>}
          bottomRight={
            <Text fontSize={20} lineHeight={1.4}>
              +2.01%
            </Text>
          }
        />
      </Panel>

      <Panel rounded p={24} bg="white" area="liquidity">
        <FourByFour
          topLeft={<Hint>DAI Liquidity</Hint>}
          bottomLeft={
            <Text fontSize={20} color="maker" lineHeight={1.4} fontWeight={500}>
              42561.31 DAI
            </Text>
          }
          topRight={<Hint>ETH Liquidity</Hint>}
          bottomRight={
            <Text
              fontSize={20}
              color="uniswappink"
              lineHeight={1.4}
              fontWeight={500}
            >
              419.27 ETH
            </Text>
          }
        />
      </Panel>

      <Panel rounded bg="white" area="statistics">
        <Box p={24}>
          <Flex alignItems="center" justifyContent="space-between">
            <Text>Pool Statistics</Text>
            <Box bg="uniswappink">
              <code>Timeframe Dropdown</code>
            </Box>
          </Flex>
        </Box>
        <Divider />

        <Box p={24}>
          <Image src="./chart.png" />
          <Flex mt={3} justifyContent="flex-end">
            <Button mr={[1, 2]} fontSize={[0, 1]} bg="maker">
              DAI
            </Button>
            <Button mr={[1, 2]} fontSize={[0, 1]} bg="uniswappink">
              ETH
            </Button>
            <Button mr={[1, 2]} fontSize={[0, 1]} bg="ronchi">
              Rate
            </Button>
            <Button fontSize={[0, 1]} bg="zircon">
              Volume
            </Button>
          </Flex>
        </Box>
      </Panel>

      <Panel rounded bg="white" area="exchange">
        <Box p={24}>
          <Hint color="textSubtext" mb={3}>
            Exchange Address
          </Hint>
          <Text style={{ wordBreak: "break-all" }} color="button">
            0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359
          </Text>
        </Box>

        <Box p={24}>
          <Hint color="textSubtext" mb={3}>
            Token Address
          </Hint>
          <Text style={{ wordBreak: "break-all" }} color="button">
            0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359
          </Text>
        </Box>
      </Panel>

      <Panel rounded bg="white" area="transactions">
        <Flex p={24} justifyContent="space-between">
          <Text color="text">Latest Transactions</Text>
          <Text>↓</Text>
        </Flex>
        <Divider />
        <Box p={24}>
          <Flex mb={24} justifyContent="space-between">
            <Text color="button">0.002 ETH for 25.76 OMG</Text>
            <Text color="textDim">1 min ago</Text>
          </Flex>
          <Flex mb={24} justifyContent="space-between">
            <Text color="button">0.002 ETH for 25.76 OMG</Text>
            <Text color="textDim">1 min ago</Text>
          </Flex>
          <Flex mb={24} justifyContent="space-between">
            <Text color="button">0.002 ETH for 25.76 OMG</Text>
            <Text color="textDim">1 min ago</Text>
          </Flex>
        </Box>
      </Panel>
    </Dashboard>
  </Wrapper>
);

export default App;
