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

import { setThemeColor, isWeb3Available } from "./helpers/";

const timeframeOptions = [
  { value: 7, label: "1 week" },
  { value: 30, label: "1 month" },
  { value: 365, label: "1 year" }
];

class App extends Component {
  state = {
    historyDaysToQuery: 7
  };

  // Fetch Exchange's Transactions
  fetchTransactions = () =>
    this.props.transactionsStore.fetchTransactions(
      this.props.directoryStore.state.activeExchange.exchangeAddress,
      this.state.historyDaysToQuery
    );

  clearCurrentExchange = () => {
    // TODO this.props.chartStore.resetChart();
    this.props.transactionsStore.resetTransactions();
    this.props.poolStore.resetUserPool();
  };

  // Fetch User Pool Information
  fetchUserPoolShare = async () => {
    try {
      await isWeb3Available();

      this.props.poolStore.fetchUserPool(
        this.props.directoryStore.state.activeExchange.exchangeAddress,
        web3.eth.accounts[0] // eslint-disable-line
      );
    } catch {}
  };

  // switch active exchane
  switchActiveExchange = async address => {
    try {
      // prep, clear current exchange's data
      await this.clearCurrentExchange();

      // first, set the active exchange
      await this.props.directoryStore.setActiveExchange(address);

      // second, set the new theme color from active exchange
      await setThemeColor(this.props.directoryStore.state.activeExchange.theme);

      // third, fetch the new ticker information
      await this.props.directoryStore.fetchTicker(address);

      // fourth - a, fetch new transaction information
      this.fetchTransactions();

      // fourth - b, fetch new user pool share information if web3
      this.fetchUserPoolShare();

      // fourth - c, fetch the chart data for default exchange
      // TODO this.fetchChart();
    } catch (err) {
      console.log("error:", err);
    }
  };

  // switch exchange history & transaction timeline
  switchExchangeTimeframe = async () => {
    await this.props.transactionsStore.resetTransactions();
    // TODO await this.props.chartStore.resetChart();

    this.fetchTransactions();

    // TODO this.fetchChart();
  };

  async componentDidMount() {
    try {
      // first, fetch directory & set default exchange address
      await this.props.directoryStore.fetchDirectory();

      // second, run "switchActiveExchange" with default exchange address
      await this.switchActiveExchange(
        this.props.directoryStore.state.defaultExchangeAddress
      );
    } catch (err) {
      console.log("error:", err);
    }
  }

  render() {
    // spread state into cleaner vars
    const {
      exchangeAddress,
      tradeVolume,
      percentChange,
      symbol,
      erc20Liquidity,
      price,
      invPrice,
      ethLiquidity,
      tokenAddress
    } = this.props.directoryStore.state.activeExchange;

    // Directory Store
    const {
      state: { directory }
    } = this.props.directoryStore;

    // Transactions Store
    const {
      state: { transactions }
    } = this.props.transactionsStore;

    // Pool Store
    const {
      state: { userNumPoolTokens, userPoolPercent }
    } = this.props.poolStore;

    if (directory.length === 0)
      return (
        <Wrapper>
          <Loader />
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
            options={directory}
            defaultValue={directory[0]}
            onChange={select => {
              if (exchangeAddress !== select.value)
                this.switchActiveExchange(select.value);
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
                      if (this.state.historyDaysToQuery !== select.value)
                        this.setState(
                          {
                            historyDaysToQuery: select.value
                          },
                          () => this.switchExchangeTimeframe()
                        );
                    }}
                  />
                </Box>
              </Flex>
            </Box>
            <Divider />

            {/* <Box p={24}>
              {currentExchangeData.chartData &&
              currentExchangeData.chartData.length > 0 ? (
                <Chart symbol={symbol} data={currentExchangeData.chartData} />
              ) : (
                <Loader />
              )}
            </Box> */}
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
