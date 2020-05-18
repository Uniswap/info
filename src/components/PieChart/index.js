import React from 'react'
import styled from 'styled-components'
import { Pie, Tooltip, PieChart, ResponsiveContainer } from 'recharts'
import { RowBetween } from '../Row'
import { Text } from 'rebass'
import { formattedNum, toK } from '../../helpers'

const ChartWrapper = styled.div`
  min-height: 300px;
  width: 100%;
`

const PieChartComponent = ({ v1, v2 }) => {
  const data = [
    {
      name: 'V2',
      value: v2
    },
    {
      name: 'V1',
      value: v1
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
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie dataKey="value" data={data} fill="#FF007A" />
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
    </ChartWrapper>
  )
}

export default PieChartComponent
