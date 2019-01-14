import React from "react";
import styled from "styled-components";
import { Box, Button, Flex, Text, Image } from "rebass";

import Wrapper from "./components/Theme";
import Title from "./components/Title";
import FourByFour from "./components/FourByFour";
import Panel from "./components/Panel";
import Dashboard from "./components/Dashboard";
import Select from "./components/Select";
import Footer from "./components/Footer";
import TransactionsList from "./components/TransactionsList";
import Link from "./components/Link";

import { tokenOptions, urls } from "./helpers/";

const Address = props => (
  <Link {...props} color="button" external style={{ wordBreak: "break-all" }}>
    {props.children}
  </Link>
);

const Header = styled(Panel)`
  display: grid;
  grid-template-columns: 1fr 216px;
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

const timeframeOptions = [
  { value: "day", label: "1 day" },
  { value: "week", label: "1 week" },
  { value: "month", label: "1 month" }
];

const App = () => (
  <Wrapper>
    <Header
      px={24}
      py={3}
      bg={["mineshaft", "transparent"]}
      color={["white", "black"]}
    >
      <Title />
      <Select defaultValue={tokenOptions[22]} options={tokenOptions} />
    </Header>

    <Dashboard mx="auto" px={[0, 3]}>
      <Box style={{ gridArea: "volume" }}>
        <Panel grouped rounded color="white" bg="jaguar" p={24}>
          <FourByFour
            gap={24}
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
        <Panel grouped rounded color="white" bg="maker" p={24}>
          <FourByFour
            topLeft={<Hint color="textLight">Your share</Hint>}
            bottomLeft={
              <Text fontSize={20} lineHeight={1.4} fontWeight={500}>
                47 Pool Tokens
              </Text>
            }
            bottomRight={
              <Text fontSize={20} lineHeight={1.4}>
                2.5%
              </Text>
            }
          />
          <FourByFour
            mt={3}
            topLeft={<Hint color="textLight">Your fees</Hint>}
            bottomLeft={
              <Text fontSize={20} lineHeight={1.4} fontWeight={500}>
                0.0841 DAI
              </Text>
            }
            bottomRight={
              <Text fontSize={20} lineHeight={1.4}>
                -0.0004 ETH
              </Text>
            }
          />
        </Panel>
      </Box>

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
            <Box width={144}>
              <Select
                placeholder="..."
                defaultValue={timeframeOptions[1]}
                options={timeframeOptions}
              />
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
            <Button
              mr={[1, 2]}
              fontSize={[0, 1]}
              variant="outline"
              borderColor="ronchi"
              color="ronchi"
            >
              Rate
            </Button>
            <Button fontSize={[0, 1]} color="text" bg="zircon">
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
          <Address
            href={urls.showAddress(
              "0x09cabec1ead1c0ba254b09efb3ee13841712be14"
            )}
          >
            0x09cabec1ead1c0ba254b09efb3ee13841712be14
          </Address>
        </Box>

        <Box p={24}>
          <Hint color="textSubtext" mb={3}>
            Token Address
          </Hint>
          <Address
            href={urls.showAddress(
              "0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359"
            )}
          >
            0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359
          </Address>
        </Box>
      </Panel>

      <Panel rounded bg="white" area="transactions">
        <Flex p={24} justifyContent="space-between">
          <Text color="text">Latest Transactions</Text>
          <Text>↓</Text>
        </Flex>
        <Divider />
        <TransactionsList />
      </Panel>
    </Dashboard>

    <Footer />
  </Wrapper>
);

export default App;
