import React from 'react'
import styled from 'styled-components'
import { Pie, Tooltip, PieChart, ResponsiveContainer } from 'recharts'
import { RowBetween } from '../Row'
import { Text } from 'rebass'
import { toK } from '../../helpers'

const ChartWrapper = styled.div`
  min-height: 280px;
  width: 100%;
`

const PieChartComponent = ({ v1, v2 }) => {
  const total = v1 + v2

  const data = [
    {
      name: 'V2',
      value: (v2 * 100) / total
    },
    {
      name: 'V1',
      value: (v1 * 100) / total
    }
  ]

  return (
    <ChartWrapper>
      <RowBetween>
        <Text fontSize={16} fontWeight={500}>
          Liquidity Breakdown
        </Text>
        <div />
      </RowBetween>
      {v1 && v2 && (
        <div style={{ height: '300px' }}>
          <ResponsiveContainer>
            <PieChart width={100}>
              <Pie
                dataKey="value"
                data={data}
                fill="#FF007A"
                label={({ cx, cy, midAngle, innerRadius, outerRadius, value, index }) => {
                  const RADIAN = Math.PI / 180
                  // eslint-disable-next-line
                  const radius = 25 + innerRadius + (outerRadius - innerRadius)
                  // eslint-disable-next-line
                  const x = cx + radius * Math.cos(-midAngle * RADIAN)
                  // eslint-disable-next-line
                  const y = cy + radius * Math.sin(-midAngle * RADIAN)

                  return (
                    <text x={x} y={y} fill="#8884d8" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                      {data && data[index].name + ' ~ ' + value.toFixed(0) + '%'}
                    </text>
                  )
                }}
              />
              <Tooltip
                cursor={true}
                formatter={val => toK(val, true)}
                labelStyle={{ paddingTop: 4 }}
                contentStyle={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  color: 'black'
                }}
                wrapperStyle={{ top: -70, left: -10 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartWrapper>
  )
}

export default PieChartComponent
