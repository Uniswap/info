import React, { Component } from "react";
import { Box, Flex, Text } from "rebass";

import Wrapper from "./components/Theme";
import Title from "./components/Title";
import FourByFour from "./components/FourByFour";
import Panel from "./components/Panel";
import Dashboard from "./components/Dashboard";
import Select from "./components/Select";
import Footer from "./components/Footer";
import TransactionsList from "./components/TransactionsList";
import Chart from "./components/Chart";
import Loader from "./components/Loader";
import { Header, Divider, Hint, Address } from "./components";

import {
  retrieveExchangeTicker,
  retrieveExchangeHistory,
  retrieveExchangeDirectory
} from "./helpers/";

import { useWeb3Context } from "web3-react/hooks";

let historyDaysToQuery = 7;
let currentExchangeData;
let web3 = null;

const timeframeOptions = [
  { value: 7, label: "1 week" },
  { value: 30, label: "1 month" },
  { value: 365, label: "1 year" }
];

const Web3Setter = props => {
  if (web3 === null) {
    web3 = useWeb3Context();
  }

  return <div className="dlfkjd" />;
};

class App extends Component {
  state = {
    exchangeData: [],
    exchangeOptions: [],
    defaultExchangeAddress: "",
    activeExchangeData: {},
    historyDaysToQuery: 7
  };

  // Fetch Exchange's Transactions
  fetchTransactions = () => {
    this.props.transactionsStore.fetchTransactions(
      this.state.activeExchangeData.exchangeAddress,
      this.state.historyDaysToQuery
    );
  };

  // Fetch User Pool Information
  fetchUserPoolShare = () => {
    this.props.poolStore.fetchUser(
      this.state.activeExchangeData.exchangeAddress,
      web3.account
    );
  };

  componentDidMount() {
    console.log("props: ", this.props);
    // load the list of all exchanges
    retrieveExchangeDirectory((directoryLabels, directoryObjects) => {
      this.setState({
        exchangeData: directoryObjects,
        exchangeOptions: directoryLabels,
        defaultExchangeAddress: directoryLabels[0].value
      });

      this.setCurrentExchange(this.state.defaultExchangeAddress);

      // set 'activeExchangeData' equal to 'defaultExchangeAddress's' value from 'exchangeData' but better cause stateful
      this.setState({
        activeExchangeData: this.state.exchangeData[
          this.state.defaultExchangeAddress
        ]
      });

      this.fetchTransactions();

      this.fetchUserPoolShare();
    });
  }

  // Retreive Data for exchange by it's address
  getExchangeData = address => this.state.exchangeData[address];

  // Set the current exchange's data to be shown
  // @TOOD improve callback hell
  setCurrentExchange = address => {
    // make a var hold the data from exhange in state
    currentExchangeData = this.getExchangeData(address);

    // update theme color from exchnage
    document.documentElement.style.setProperty(
      "--c-token",
      currentExchangeData.theme || "#333333"
    );

    // refresh the UI
    this.setState({});

    // retrieve the ticker which displays the latest 24hr details
    retrieveExchangeTicker(currentExchangeData, () => {
      // only update UI if we're still displaying the initial requested address
      if (currentExchangeData.exchangeAddress === address) {
        // refresh the UI
        this.setState({});

        retrieveExchangeHistory(currentExchangeData, historyDaysToQuery, () => {
          // only update UI if we're still displaying the initial requested address
          if (currentExchangeData.exchangeAddress === address) {
            // refresh the UI
            this.setState({});
          }
        });
      }
    });
  };

  render() {
    // spread state into cleaner vars
    const {
      exchangeAddress,
      tradeVolume,
      percentChange,
      symbol,
      chartData,
      erc20Liquidity,
      price,
      invPrice,
      ethLiquidity,
      tokenAddress
    } = this.state.activeExchangeData;

    // Transactions Store
    const {
      state: { transactions }
    } = this.props.transactionsStore;

    // Pool Store
    const {
      state: { userNumPoolTokens, userPoolPercent }
    } = this.props.poolStore;

    if (this.state.exchangeOptions.length === 0)
      return (
        <Wrapper>
          {/* @TODO: find better way to handle this */}
          <>
            <Loader />
            <Web3Setter />
          </>
        </Wrapper>
      );

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
            options={this.state.exchangeOptions}
            onChange={select => {
              // @NOTE stateful way to do things, duplicated atm
              if (exchangeAddress !== select.value)
                this.setState({
                  activeExchangeData: this.state.exchangeData[select.value]
                });

              // only update current exchange if we're picking a new one
              if (currentExchangeData.exchangeAddress !== select.value)
                this.setCurrentExchange(select.value);
            }}
          />
        </Header>

        <Dashboard mx="auto" px={[0, 3]}>
          <Box style={{ gridArea: "volume" }}>
            <Panel grouped rounded color="white" bg="jaguar" p={24}>
              <FourByFour
                gap={24}
                topLeft={<Hint color="textLightDim">{symbol} Volume</Hint>}
                bottomLeft={
                  <Text fontSize={24} lineHeight={1.4} fontWeight={500}>
                    {tradeVolume}
                  </Text>
                }
                topRight={<Hint color="textLightDim">24h</Hint>}
                bottomRight={
                  <Text fontSize={20} lineHeight={1.4}>
                    {percentChange}%
                  </Text>
                }
              />
            </Panel>
            <Panel
              grouped
              rounded
              color="white"
              bg="token"
              p={24}
              className="-transition"
            >
              <FourByFour
                topLeft={<Hint color="textLight">Your share</Hint>}
                bottomLeft={
                  <Text fontSize={20} lineHeight={1.4} fontWeight={500}>
                    {userNumPoolTokens} Pool Tokens
                  </Text>
                }
                bottomRight={
                  <Text fontSize={20} lineHeight={1.4}>
                    {userPoolPercent}%
                  </Text>
                }
              />
            </Panel>
          </Box>

          <Panel rounded bg="white" area="liquidity">
            <FourByFour
              p={24}
              topLeft={<Hint color="text">{symbol} Liquidity</Hint>}
              bottomLeft={
                <Text
                  fontSize={20}
                  color="token"
                  className="-transition"
                  lineHeight={1.4}
                  fontWeight={500}
                >
                  {erc20Liquidity || `0.00`}
                </Text>
              }
              topRight={<Hint color="text">ETH Liquidity</Hint>}
              bottomRight={
                <Text
                  fontSize={20}
                  color="uniswappink"
                  lineHeight={1.4}
                  fontWeight={500}
                >
                  {ethLiquidity || `0.00`}
                </Text>
              }
            />
            <Divider />
            <FourByFour
              p={24}
              topLeft={<Hint color="text">{symbol} / ETH</Hint>}
              bottomLeft={
                <Text
                  color="token"
                  className="-transition"
                  fontSize={20}
                  lineHeight={1.4}
                  fontWeight={500}
                >
                  {Number(price).toFixed(2)}
                </Text>
              }
              topRight={<Hint color="text">ETH / {symbol}</Hint>}
              bottomRight={
                <Text
                  color="uniswappink"
                  fontSize={20}
                  lineHeight={1.4}
                  fontWeight={500}
                >
                  {Number(invPrice).toFixed(4)}
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
                    placeholder="Timeframe"
                    options={timeframeOptions}
                    defaultValue={timeframeOptions[0]}
                    onChange={select => {
                      // @NOTE: NEW
                      // retrigger the fetchTransactions call only when historyDaysToQuery changes
                      if (this.state.historyDaysToQuery !== select.value) {
                        this.setState(
                          {
                            historyDaysToQuery: select.value
                          },
                          () => this.fetchTransactions()
                        );
                      }

                      // @NOTE: OLD
                      historyDaysToQuery = select.value;

                      // wipes chart and transaction data, will need to work into state
                      currentExchangeData.chartData = [];

                      retrieveExchangeHistory(
                        currentExchangeData,
                        historyDaysToQuery,
                        () => {
                          this.setState({});
                        }
                      );
                    }}
                  />
                </Box>
              </Flex>
            </Box>
            <Divider />

            <Box p={24}>
              {chartData && chartData.length > 0 ? (
                <Chart symbol={symbol} data={chartData} />
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
              <Address address={exchangeAddress} />
            </Box>

            <Box p={24}>
              <Hint color="textSubtext" mb={3}>
                Token Address
              </Hint>
              <Address address={tokenAddress} />
            </Box>
          </Panel>

          <Panel rounded bg="white" area="transactions">
            <Flex p={24} justifyContent="space-between">
              <Text color="text">Latest Transactions</Text>
              <Text>↓</Text>
            </Flex>
            <Divider />

            {transactions && transactions.length > 0 ? (
              <TransactionsList
                transactions={transactions}
                tokenSymbol={symbol}
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

export default App;
