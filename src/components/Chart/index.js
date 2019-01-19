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

const data = [
  { name: "Page A", uv: 590, pv: 800, amt: 1400 },
  { name: "Page B", uv: 868, pv: 967, amt: 1506 },
  { name: "Page C", uv: 1397, pv: 1098, amt: 989 },
  { name: "Page D", uv: 1480, pv: 1200, amt: 1228 },
  { name: "Page E", uv: 1520, pv: 1108, amt: 1100 },
  { name: "Page F", uv: 1400, pv: 680, amt: 1700 },
  { name: "Page A", uv: 590, pv: 800, amt: 1400 },
  { name: "Page B", uv: 868, pv: 967, amt: 1506 },
  { name: "Page C", uv: 1397, pv: 1098, amt: 989 },
  { name: "Page D", uv: 1480, pv: 1200, amt: 1228 },
  { name: "Page E", uv: 1520, pv: 1108, amt: 1100 },
  { name: "Page F", uv: 1400, pv: 680, amt: 1700 },
  { name: "Page A", uv: 590, pv: 800, amt: 1400 },
  { name: "Page B", uv: 868, pv: 967, amt: 2380 },
  { name: "Page C", uv: 1397, pv: 1098, amt: 989 },
  { name: "Page D", uv: 1480, pv: 1200, amt: 1228 },
  { name: "Page E", uv: 1520, pv: 1108, amt: 1100 },
  { name: "Page F", uv: 1400, pv: 680, amt: 1700 },
  { name: "Page C", uv: 1397, pv: 1098, amt: 989 },
  { name: "Page D", uv: 1480, pv: 1200, amt: 1228 },
  { name: "Page E", uv: 1520, pv: 1108, amt: 1100 },
  { name: "Page F", uv: 1400, pv: 680, amt: 1700 },
  { name: "Page D", uv: 1480, pv: 1200, amt: 1228 },
  { name: "Page E", uv: 1520, pv: 1108, amt: 1100 },
  { name: "Page F", uv: 1400, pv: 680, amt: 1700 },
  { name: "Page A", uv: 590, pv: 800, amt: 1400 }
];

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

const Chart = () => {
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
            dataKey="name"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          {/* <Tooltip /> */}
          <Bar
            hide={volume}
            dataKey="pv"
            shape={<CustomBar />}
            fill="var(--c-zircon)"
          />
          <Line
            hide={token}
            type="monotone"
            dataKey="amt"
            stroke="var(--c-maker)"
          />
          <Line
            hide={rate}
            type="monotone"
            dataKey="pv"
            stroke="var(--c-ronchi)"
          />
          <Line
            hide={eth}
            type="monotone"
            dataKey="uv"
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
