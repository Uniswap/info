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

const CustomBar = props => {
  const { fill, x, y, width, height } = props;

  return <rect x={x} y={y} width={width} height={height} rx={2} fill={fill} />;
};

CustomBar.defaultProps = {
  fill: "transparent",
  x: 0,
  y: 0,
  width: 0,
  height: 0
};

CustomBar.propTypes = {
  fill: PropTypes.string,
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number
};

const Controls = styled.div`
  display: grid;
  grid-template-columns: repeat(4, max-content);
  grid-column-gap: 8px;
`;

const Chart = ({ data }) => {
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
            orientation="left"
            type="number"
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            orientation="right"
            type="number"
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
              border: "none"
            }}
          />
          <Bar
            hide={volume}
            dataKey="volume"
            shape={<CustomBar />}
            fill="var(--c-zircon)"
          />
          <Line
            hide={token}
            type="monotone"
            dataKey="tokenLiquidity"
            stroke="var(--c-maker)"
          />
          <Line
            hide={rate}
            type="monotone"
            dataKey="rate"
            stroke="var(--c-ronchi)"
          />}
          <Line
            hide={eth}
            type="monotone"
            dataKey="ethLiquidity"
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
            DAI
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
