import React, { Component } from "react";
import styled from "styled-components";
import { Box, Flex, Text } from "rebass";
import Wrapper from "./components/Theme";
import Title from "./components/Title";
import FourByFour from "./components/FourByFour";
import Panel from "./components/Panel";
import Dashboard from "./components/Dashboard";
import Select from "./components/Select";
import Footer from "./components/Footer";
import TransactionsList from "./components/TransactionsList";
import Link from "./components/Link";
import Chart from "./components/Chart";
import Loader from "./components/Loader";

import {
  urls,
  retrieveExchangeTicker,
  retrieveUserPoolShare,
  retrieveExchangeHistory,
  retrieveExchangeDirectory
} from "./helpers/";

import { useWeb3Context } from "web3-react/hooks";

// all our exchange options keyed by exchange address
let exchangeDataRaw = {};
let exchangeSelectOptions = [];

let historyDaysToQuery = 7;
let currentExchangeData;
let app;
let web3 = null;

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
  // { value: "1", label: "1 day" },
  { value: "7", label: "1 week" },
  { value: "30", label: "1 month" },
  { value: "365", label: "1 year" }
];

const Web3Setter = props => {
  if (web3 === null) {
    web3 = useWeb3Context();
  }

  return <div className="dlfkjd" />;
};

class App extends Component {
  constructor(props) {
    super(props);

    app = this;
  }

  // Retreive Data for exchange by it's address
  // @TODO: move this data into state
  getExchangeData = address => exchangeDataRaw[address];

  componentDidMount(props) {
    // load the list of all exchanges
    retrieveExchangeDirectory((directoryLabels, directoryObjects) => {
      exchangeSelectOptions = directoryLabels;
      exchangeDataRaw = directoryObjects;

      var defaultExchangeAddress = directoryLabels[0].value;

      app.setCurrentExchange(defaultExchangeAddress);
    });
  }

  // Set the current exchange's data to be shown
  setCurrentExchange(address) {
    currentExchangeData = app.getExchangeData(address);

    // What is this for?
    app.setState({});

    // retrieve the ticker which displays the latest 24hr details
    retrieveExchangeTicker(currentExchangeData, () => {
      // only update UI if we're still displaying the initial requested address
      if (currentExchangeData.exchangeAddress === address) {
        // refresh the UI
        app.setState({});

        retrieveUserPoolShare(currentExchangeData, web3.account, () => {
          if (currentExchangeData.exchangeAddress === address) {
            // refresh the UI
            app.setState({});

            retrieveExchangeHistory(
              currentExchangeData,
              historyDaysToQuery,
              () => {
                if (currentExchangeData.exchangeAddress === address) {
                  // refresh the UI
                  app.setState({});
                }
              }
            );
          }
        });
      }
    });
  }

  render() {
    if (exchangeSelectOptions.length === 0) {
      // TODO Show loading indicator
      console.log("loading");

      return (
        <Wrapper>
          {/* @TODO: find better way to handle this */}
          <>
            <Web3Setter />
          </>
        </Wrapper>
      );
    } else {
      return (
        <Wrapper>
          <Header
            px={24}
            py={3}
            bg={["mineshaft", "transparent"]}
            color={["white", "black"]}
          >
            <Title />

            <Select
              options={exchangeSelectOptions}
              onChange={newOption => {
                // only update current exchange if we're picking a new one
                if (currentExchangeData.exchangeAddress !== newOption.value)
                  app.setCurrentExchange(newOption.value);
              }}
            />
          </Header>

          <Dashboard mx="auto" px={[0, 3]}>
            <Box style={{ gridArea: "volume" }}>
              <Panel grouped rounded color="white" bg="jaguar" p={24}>
                <FourByFour
                  gap={24}
                  topLeft={
                    <Hint color="textLightDim">
                      {currentExchangeData.symbol} Volume
                    </Hint>
                  }
                  bottomLeft={
                    <Text fontSize={24} lineHeight={1.4} fontWeight={500}>
                      {currentExchangeData.tradeVolume}
                    </Text>
                  }
                  topRight={<Hint color="textLightDim">24h</Hint>}
                  bottomRight={
                    <Text fontSize={20} lineHeight={1.4}>
                      {currentExchangeData.percentChange}
                    </Text>
                  }
                />
              </Panel>
              <Panel grouped rounded color="white" bg="maker" p={24}>
                <FourByFour
                  topLeft={<Hint color="textLight">Your share</Hint>}
                  bottomLeft={
                    <Text fontSize={20} lineHeight={1.4} fontWeight={500}>
                      {currentExchangeData.userPoolTokens}
                    </Text>
                  }
                  bottomRight={
                    <Text fontSize={20} lineHeight={1.4}>
                      {currentExchangeData.userPoolPercent}
                    </Text>
                  }
                />
                <FourByFour
                  mt={3}
                  topLeft={<Hint color="textLight">Your fees</Hint>}
                  bottomLeft={
                    <Text fontSize={20} lineHeight={1.4} fontWeight={500}>
                      0.00 {currentExchangeData.symbol}
                    </Text>
                  }
                  bottomRight={
                    <Text fontSize={20} lineHeight={1.4}>
                      0.00 ETH
                    </Text>
                  }
                />
              </Panel>
            </Box>

            <Panel rounded p={24} bg="white" area="liquidity">
              <FourByFour
                topLeft={<Hint>{currentExchangeData.symbol} Liquidity</Hint>}
                bottomLeft={
                  <Text
                    fontSize={20}
                    color="maker"
                    lineHeight={1.4}
                    fontWeight={500}
                  >
                    {currentExchangeData.erc20Liquidity || `0.00`}
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
                    {currentExchangeData.ethLiquidity || `0.00 ETH`}
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
                      options={timeframeOptions}
                      onChange={newOption => {
                        historyDaysToQuery = newOption.value;

                        currentExchangeData.recentTransactions = [];
                        currentExchangeData.chartData = [];

                        retrieveExchangeHistory(
                          currentExchangeData,
                          historyDaysToQuery,
                          () => {
                            app.setState({});
                          }
                        );
                      }}
                    />
                  </Box>
                </Flex>
              </Box>
              <Divider />

              <Box p={24}>
                {currentExchangeData.chartData.length > 0 ? (
                  <Chart data={currentExchangeData.chartData} />
                ) : (
                  <Loader />
                )}
              </Box>
            </Panel>

            <Panel rounded bg="white" area="exchange">
              <Box p={24}>
                <Hint color="textSubtext" mb={3}>
                  Exchange Address
                </Hint>
                <Address
                  href={urls.showAddress(currentExchangeData.exchangeAddress)}
                >
                  {currentExchangeData.exchangeAddress}
                </Address>
              </Box>

              <Box p={24}>
                <Hint color="textSubtext" mb={3}>
                  Token Address
                </Hint>
                <Address
                  href={urls.showAddress(currentExchangeData.tokenAddress)}
                >
                  {currentExchangeData.tokenAddress}
                </Address>
              </Box>
            </Panel>

            <Panel rounded bg="white" area="transactions">
              <Flex p={24} justifyContent="space-between">
                <Text color="text">Latest Transactions</Text>
                {/* <Text>↓</Text> */}
              </Flex>
              <Divider />

              {currentExchangeData.recentTransactions.length > 0 ? (
                <TransactionsList
                  transactions={currentExchangeData.recentTransactions}
                  tokenSymbol={currentExchangeData.symbol}
                />
              ) : (
                <Loader />
              )}
            </Panel>
          </Dashboard>

          <Footer />
        </Wrapper>
      );
    }
  }
}

export default App;
