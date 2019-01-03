/**
 * @prettier
 */

import React from "react";
import styled from "styled-components";
import { Box, Flex, Text, Image } from "rebass";

import Theme from "./components/Theme";
import Title from "./components/Title";

const Panel = styled(Box)`
  position: relative;

  ${props => (props.rounded ? "border-radius: 10px 10px 0 0;" : null)};

  &:not(:last-child) {
    :after {
      content: "";
      position: absolute;
      bottom: -10px;
      left: 0;
      right: 0;
      height: 10px;
      background-color: inherit;
    }
  }
`;

const Header = styled(Panel)`
  display: grid;
  grid-template-columns: minmax(max-content, 2fr) minmax(200px, 1fr);
  align-items: center;
`;

const Hint = props => (
  <Text
    {...props}
    fontSize={12}
    color={props.light ? "rgba(255, 255, 255, 0.6)" : "#737373"}
  >
    {props.children}
  </Text>
);

const App = () => (
  <Theme>
    <>
      <Header px={24} py={3} bg="#333333" color="white">
        <Title />
        {/* DROPDOWN */}
      </Header>

      <Panel color="white" bg="#2B2B2B" p={24} rounded>
        <Flex>
          <Flex flexDirection="column" width={1}>
            <Hint light mb={2}>
              DAI Volume
            </Hint>
            <Text fontSize={24} lineHeight={1.4} fontWeight={500}>
              130.83 ETH
            </Text>
          </Flex>
          <Flex flexDirection="column" alignItems="flex-end" width={1}>
            <Hint light mb={2}>
              24h
            </Hint>
            <Text fontSize={20} lineHeight={1.4}>
              +2.01%
            </Text>
          </Flex>
        </Flex>
      </Panel>

      <Panel bg="white" rounded>
        <Box p={24}>
          <Flex alignItems="space-around">
            <Hint>Pool Statistics</Hint>
          </Flex>
        </Box>
        <Box bg="rgba(43, 43, 43, 0.05)" style={{ height: 1 }} />
        <Box p={24}>
          <Flex>
            <Flex flexDirection="column" width={1}>
              <Hint mb={2}>Liquidity</Hint>
              <Text
                fontSize={20}
                color="#71C4AD"
                lineHeight={1.4}
                fontWeight={500}
              >
                42561.31 DAI
              </Text>
            </Flex>
            <Flex
              flexDirection="column"
              justifyContent="flex-end"
              alignItems="flex-end"
              width={1}
            >
              <Text
                fontSize={20}
                color="#DC6BE5"
                lineHeight={1.4}
                fontWeight={500}
              >
                419.27 ETH
              </Text>
            </Flex>
          </Flex>
        </Box>
        <Box p={24}>
          <Image src="./chart.png"/>
        </Box>
      </Panel>
    </>
  </Theme>
);

export default App;
