import React, { useState } from "react";
import {
  Line,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ComposedChart
} from "recharts";
import { Flex, Button } from "rebass";
import styled from "styled-components";
import PropTypes from "prop-types";

import CustomBar from "./customBar";
import { toK } from "../../helpers";

const Controls = styled.div`
  display: grid;
  grid-template-columns: repeat(4, max-content);
  grid-column-gap: 8px;
`;

const Chart = ({ data, symbol }) => {
  const [volume, toggleVolume] = useState(false);
  const [eth, toggleEth] = useState(false);
  const [token, toggleToken] = useState(false);
  const [rate, toggleRate] = useState(false);

  return (
    <>
      <ResponsiveContainer aspect={21 / 9}>
        <ComposedChart
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          barCategoryGap={1}
          data={data}
        >
          <XAxis
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            dataKey="date"
          />
          <YAxis
            type="number"
            axisLine={false}
            tickFormatter={tick => toK(tick)}
            tickLine={false}
            interval="preserveStartEnd"
            yAxisId={0}
          />
          <YAxis
            orientation="right"
            type="number"
            tickFormatter={tick => toK(tick)}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            yAxisId={1}
          />
          <Tooltip
            cursor={false}
            labelStyle={{ paddingTop: 4 }}
            contentStyle={{
              padding: "10px 14px",
              borderRadius: 10,
              borderColor: "var(--c-zircon)"
            }}
          />
          <Bar
            hide={volume}
            dataKey="volume"
            name="Volume"
            yAxisId={0}
            shape={<CustomBar />}
            fill="var(--c-zircon)"
          />
          <Line
            hide={token}
            type="monotone"
            yAxisId={1}
            dataKey="tokenLiquidity"
            name={`${symbol} Liquidity`}
            stroke="var(--c-maker)"
          />
          <Line
            hide={rate}
            type="monotone"
            name="Rate"
            yAxisId={0}
            dataKey="rate"
            stroke="var(--c-ronchi)"
          />
          <Line
            hide={eth}
            type="monotone"
            name="ETH Liquidity"
            dataKey="ethLiquidity"
            yAxisId={1}
            stroke="var(--c-uniswappink)"
          />
        </ComposedChart>
      </ResponsiveContainer>
      <Flex mt={3} justifyContent="flex-end">
        <Controls>
          <Button
            onClick={() => toggleToken(!token)}
            variant={token ? "outline" : null}
            fontSize={[0, 1]}
            color={token ? "maker" : "white"}
            borderColor="maker"
            bg="maker"
          >
            {symbol}
          </Button>
          <Button
            onClick={() => toggleEth(!eth)}
            variant={eth ? "outline" : null}
            fontSize={[0, 1]}
            color={eth ? "uniswappink" : "white"}
            borderColor="uniswappink"
            bg="uniswappink"
          >
            ETH
          </Button>
          <Button
            onClick={() => toggleRate(!rate)}
            variant={rate ? "outline" : null}
            fontSize={[0, 1]}
            color={rate ? "ronchi" : "text"}
            borderColor="ronchi"
            bg="ronchi"
          >
            Rate
          </Button>
          <Button
            onClick={() => toggleVolume(!volume)}
            variant={volume ? "outline" : null}
            fontSize={[0, 1]}
            color={volume ? "zircon" : "text"}
            borderColor="zircon"
            bg="zircon"
          >
            Volume
          </Button>
        </Controls>
      </Flex>
    </>
  );
};

export default Chart;
