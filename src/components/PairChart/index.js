import React, { useState } from "react"
import styled from "styled-components"
import {
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  BarChart,
  Bar
} from "recharts"
import Row from "../Row"
import DropdownSelect from "../../components/DropdownSelect"

import { toK, toNiceDate, toNiceDateYear } from "../../helpers"

const ChartWrapper = styled.div`
  padding-top: 40px;
  margin-left: -1em;
`

const OptionsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
`

const Option = styled.div`
  font-weight: ${({ active }) => (active ? "500" : "400")};
  &:hover {
    cursor: pointer;
  }
`

const GlobalChart = ({ chartData }) => {
  const options = [
    { text: "All Time" },
    { text: "3 Months" },
    { text: "1 week" }
  ]
  const [chartFilter, setChartFilter] = useState("liq")
  const [timeline, setTimeline] = useState(options[0])

  return (
    <ChartWrapper>
      <OptionsWrapper>
        <Row>
          <Option
            style={{ marginRight: "20px" }}
            active={chartFilter === "liq"}
            onClick={() => setChartFilter("liq")}
          >
            Liquidity
          </Option>
          <Option
            active={chartFilter === "vol"}
            onClick={() => setChartFilter("vol")}
          >
            Volume
          </Option>
        </Row>
        <DropdownSelect
          options={options}
          active={timeline}
          setActive={setTimeline}
        />
      </OptionsWrapper>
      {chartFilter === "liq" && (
        <ResponsiveContainer aspect={60 / 12}>
          <AreaChart
            margin={{ top: 0, right: 0, bottom: 6, left: 10 }}
            barCategoryGap={1}
            data={chartData}
          >
            <XAxis
              tickLine={false}
              axisLine={false}
              interval="preserveEnd"
              tickMargin={14}
              minTickGap={80}
              tickFormatter={tick => toNiceDate(tick)}
              dataKey="date"
            />
            <YAxis
              type="number"
              tickMargin={16}
              orientation="left"
              tickFormatter={tick => toK(tick)}
              axisLine={false}
              tickLine={false}
              interval="preserveEnd"
              minTickGap={80}
              yAxisId={0}
            />
            <Tooltip
              cursor={true}
              formatter={val => toK(val, true)}
              labelFormatter={label => toNiceDateYear(label)}
              labelStyle={{ paddingTop: 4 }}
              contentStyle={{
                padding: "10px 14px",
                borderRadius: 10,
                borderColor: "var(--c-zircon)"
              }}
              wrapperStyle={{ top: -70, left: -10 }}
            />
            <Area
              strokeWidth={2}
              dot={false}
              type="monotone"
              name={" (USD)"}
              dataKey={"combinedBalanceUSD"}
              yAxisId={0}
              fill="rgba(235, 243, 255, 0.3)"
              stroke="rgba(254, 109, 222, 0.6)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
      {chartFilter === "vol" && (
        <ResponsiveContainer aspect={60 / 12}>
          <BarChart
            margin={{ top: 0, right: 0, bottom: 6, left: 10 }}
            barCategoryGap={1}
            data={chartData}
          >
            <XAxis
              tickLine={false}
              axisLine={false}
              interval="preserveEnd"
              minTickGap={80}
              tickMargin={14}
              tickFormatter={tick => toNiceDate(tick)}
              dataKey="date"
            />
            <YAxis
              type="number"
              axisLine={false}
              tickMargin={16}
              tickFormatter={tick => toK(tick)}
              tickLine={false}
              interval="preserveEnd"
              minTickGap={80}
              yAxisId={0}
            />
            <Tooltip
              cursor={true}
              formatter={val => toK(val, true)}
              labelFormatter={label => toNiceDateYear(label)}
              labelStyle={{ paddingTop: 4 }}
              contentStyle={{
                padding: "10px 14px",
                borderRadius: 10,
                borderColor: "var(--c-zircon)"
              }}
              wrapperStyle={{ top: -70, left: -10 }}
            />
            <Bar
              type="monotone"
              name={"Volume"}
              dataKey={"dailyVolumeUSD"}
              fill="rgba(254, 109, 222, 0.6)"
              opacity={"0.4"}
              yAxisId={0}
              stroke="rgba(254, 109, 222, 0.8)"
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartWrapper>
  )
}

export default GlobalChart
