/**
 * @prettier
 */

import React from "react";
import styled from "styled-components";
import { Box, Flex, Text, Image } from "rebass";

import Wrapper from "./components/Theme";
import Title from "./components/Title";
import FourByFour from "./components/FourByFour";
import Panel from "./components/Panel";

const Header = styled(Panel)`
  display: grid;
  grid-template-columns: minmax(max-content, 2fr) minmax(200px, 1fr);
  align-items: center;
`;

const Divider = styled(Box)`
  height: 1px;
  background-color: rgba(43, 43, 43, 0.05);
`;

const Dashboard = styled(Box)`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-areas:
    "volume statistics statistics statistics"
    "liquidity statistics statistics statistics"
    "exchange transactions transactions transactions";
  max-width: 1280px;
  margin: 0 auto;
`;

const Hint = props => (
  <Text
    {...props}
    fontSize={12}
    color={props.light ? "rgba(255, 255, 255, 0.6)" : "textSubtext"}
  >
    {props.children}
  </Text>
);

const App = () => (
  <Wrapper>
    <Header px={24} py={3} bg="mineshaft" color="white">
      <Title />
      {/* DROPDOWN */}
    </Header>

    <Dashboard>
      <Panel color="white" bg="jaguar" p={24} rounded area="volume">
        <FourByFour
          topLeft={<Hint light>DAI Volume</Hint>}
          bottomLeft={
            <Text fontSize={24} lineHeight={1.4} fontWeight={500}>
              130.83 ETH
            </Text>
          }
          topRight={<Hint light>24h</Hint>}
          bottomRight={
            <Text fontSize={20} lineHeight={1.4}>
              +2.01%
            </Text>
          }
        />
      </Panel>

      <Panel bg="white" rounded area="statistics">
        <Box p={24}>
          <Flex alignItems="space-around">
            <Hint>Pool Statistics</Hint>
          </Flex>
        </Box>
        <Divider />
        <Box p={24}>
          <FourByFour
            topLeft={<Hint>DAI Liquidity</Hint>}
            bottomLeft={
              <Text
                fontSize={20}
                color="maker"
                lineHeight={1.4}
                fontWeight={500}
              >
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
        </Box>
        <Box p={24}>
          <Image src="./chart.png" />
        </Box>
      </Panel>

      <Panel bg="white" rounded area="transactions">
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
