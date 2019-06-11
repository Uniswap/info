import React, { useState } from 'react'
import { Line, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, ComposedChart } from 'recharts'
import { Flex, Button } from 'rebass'
import styled from 'styled-components'
import { useMedia } from 'react-use'

import CustomBar from './customBar'
import { toK, toNiceDate, toNiceDateYear } from '../../helpers'

const Controls = styled.div`
  display: grid;
  grid-template-columns: repeat(7, max-content);
  grid-column-gap: 8px;
`

const Chart = ({ data, symbol }) => {
  const [volume, toggleVolume] = useState(false)
  const [eth, toggleEth] = useState(false)
  const [token, toggleToken] = useState(false)
  const [rate, toggleRate] = useState(false)
  const [roi, toggleROI] = useState(false)
  const [usd, toggleUSD] = useState(false)
  const [txs, toggleTxs] = useState(false)

  const isNotMobile = useMedia('(max-width: 40em)')

  return (
    <>
      <ResponsiveContainer aspect={21 / 9}>
        <ComposedChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }} barCategoryGap={1} data={data}>
          <XAxis
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            tickFormatter={tick => toNiceDate(tick)}
            dataKey="dayString"
          />
          <YAxis
            hide={isNotMobile}
            type="number"
            axisLine={false}
            tickFormatter={tick => toK(tick)}
            tickLine={false}
            interval="preserveStartEnd"
            yAxisId={0}
          />
          <YAxis
            hide={isNotMobile}
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
            formatter={val => toK(val, true)}
            labelFormatter={label => toNiceDateYear(label)}
            labelStyle={{ paddingTop: 4 }}
            contentStyle={{
              padding: '10px 14px',
              borderRadius: 10,
              borderColor: 'var(--c-zircon)'
            }}
          />
          <Bar
            hide={volume}
            dataKey="ethVolume"
            name="Volume"
            yAxisId={0}
            shape={<CustomBar />}
            fill="var(--c-zircon)"
          />
          <Line
            strokeWidth={2}
            s
            dot={false}
            hide={token}
            type="monotone"
            yAxisId={1}
            dataKey="tokenBalance"
            name={`${symbol} Liquidity`}
            stroke="var(--c-token)"
          />
          <Line
            strokeWidth={2}
            dot={false}
            hide={roi}
            type="monotone"
            name="ROI"
            yAxisId={1}
            dataKey="ROI"
            stroke="red"
          />
          <Line
            strokeWidth={2}
            dot={false}
            hide={txs}
            type="monotone"
            name="Transactions"
            yAxisId={1}
            dataKey="totalEvents"
            stroke="orange "
          />
          <Line
            strokeWidth={2}
            dot={false}
            hide={usd}
            type="monotone"
            name="Token Price USD"
            dataKey="tokenPriceUSD"
            yAxisId={1}
            stroke="green"
          />
          <Line
            strokeWidth={2}
            dot={false}
            hide={rate}
            type="monotone"
            name="Rate"
            yAxisId={1}
            dataKey="marginalEthRate"
            stroke="var(--c-button)"
          />
          <Line
            strokeWidth={2}
            dot={false}
            hide={eth}
            type="monotone"
            name="ETH Liquidity"
            dataKey="ethBalance"
            yAxisId={1}
            stroke="var(--c-uniswappink)"
          />
        </ComposedChart>
      </ResponsiveContainer>
      <Flex mt={3} justifyContent="flex-end">
        <Controls>
          <Button
            onClick={() => toggleToken(!token)}
            variant={token ? 'outline' : null}
            fontSize={[0, 1]}
            color={token ? 'token' : 'white'}
            borderColor="token"
            bg="token"
          >
            {symbol}
          </Button>
          <Button
            onClick={() => toggleEth(!eth)}
            variant={eth ? 'outline' : null}
            fontSize={[0, 1]}
            color={eth ? 'uniswappink' : 'white'}
            borderColor="uniswappink"
            bg="uniswappink"
          >
            ETH
          </Button>
          <Button
            onClick={() => toggleROI(!roi)}
            variant={roi ? 'outline' : null}
            fontSize={[0, 1]}
            color={roi ? 'red' : 'white'}
            borderColor="red"
            bg="red"
          >
            ROI
          </Button>
          <Button
            onClick={() => toggleTxs(!txs)}
            variant={txs ? 'outline' : null}
            fontSize={[0, 1]}
            color={txs ? 'orange' : 'white'}
            borderColor="orange"
            bg="orange"
          >
            Transactions
          </Button>
          <Button
            onClick={() => toggleUSD(!usd)}
            variant={usd ? 'outline' : null}
            fontSize={[0, 1]}
            color={usd ? 'green' : 'white'}
            borderColor="green"
            bg="green"
          >
            USD
          </Button>
          <Button
            onClick={() => toggleRate(!rate)}
            variant={rate ? 'outline' : null}
            fontSize={[0, 1]}
            color={rate ? 'button' : 'white'}
            borderColor="button"
            bg="button"
          >
            Rate
          </Button>
          <Button
            onClick={() => toggleVolume(!volume)}
            variant={volume ? 'outline' : null}
            fontSize={[0, 1]}
            color={volume ? 'zircon' : 'text'}
            borderColor="zircon"
            bg="zircon"
          >
            Volume
          </Button>
        </Controls>
      </Flex>
    </>
  )
}

export default Chart
