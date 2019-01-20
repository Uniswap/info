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

const Chart = ({data}) => {
  const [volume, toggleVolume] = useState(false);
  const [eth, toggleEth] = useState(false);
  const [token, toggleToken] = useState(false);
  const [rate, toggleRate] = useState(true);

  return (
    <>
      <ResponsiveContainer aspect={21 / 9}>
        <ComposedChart barCategoryGap={1} data={data}>
          <XAxis
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            dataKey="date"
          />
          {/* <YAxis
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          /> */}
          {/* <Tooltip /> */}
          <Bar
            hide={volume}
            dataKey="volume"
            shape={<CustomBar />}
            fill="var(--c-zircon)"
          />
          {/* <Line
            hide={token}
            type="monotone"
            dataKey="amt"
            stroke="var(--c-maker)"
          /> */}
          {/* <Line
            hide={rate}
            type="monotone"
            dataKey="pv"
            stroke="var(--c-ronchi)"
          /> */}
          {/* <Line
            hide={eth}
            type="monotone"
            dataKey="uv"
            stroke="var(--c-uniswappink)"
          /> */}
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
