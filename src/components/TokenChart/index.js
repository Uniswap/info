import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { PieChart, Pie, Cell, Tooltip } from 'recharts'
import { formattedNum, toNiceDateYear } from '../../utils'

const ChartWrapper = styled.div`
  height: 100%;
  min-height: 300px;

  @media screen and (max-width: 600px) {
    min-height: 200px;
  }
`

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']
const RADIAN = Math.PI / 180

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

const TokenChart = ({ data, color, asset }) => {
  const ref = useRef()
  const isClient = typeof window === 'object'
  const [width, setWidth] = useState(ref?.current?.container?.clientWidth)

  useEffect(() => {
    if (!isClient) {
      return false
    }
    function handleResize() {
      setWidth(ref?.current?.container?.clientWidth ?? width)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isClient, width]) // Empty array ensures that effect is only run on mount and unmount

  return (
    <ChartWrapper>
      <PieChart width={650} height={400}>
        <Pie
          dataKey="value"
          data={data}
          cx={300}
          cy={200}
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={180}
          fill="#8884d8"
        >
          {data.map((entry, index) => {
            return <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
          })}
        </Pie>{' '}
        <Tooltip
          cursor={true}
          formatter={val => {
            return <strong>{`${formattedNum(val)} ${asset}`}</strong>
          }}
          labelFormatter={label => label}
          labelStyle={{ paddingTop: 4 }}
          contentStyle={{
            padding: '10px 14px',
            borderRadius: 10,
            color: 'black'
          }}
          wrapperStyle={{ top: -70, left: -10 }}
        />
      </PieChart>
    </ChartWrapper>
  )
}

export default TokenChart
