import React, { useState, useEffect, useRef } from 'react'
import { createChart } from 'lightweight-charts'
import dayjs from 'dayjs'
import { formattedNum } from '../../utils'
import styled from 'styled-components'
import { Layout } from 'react-feather'

export const CHART_TYPES = {
  BAR: 'BAR',
  AREA: 'AREA'
}

const Wrapper = styled.div`
  position: relative;
`

const IconWrapper = styled.div`
  position: absolute;
  right: 0;
  background-color: white;
  border-radius: 3px;
  height: 16px;
  width: 16px;
  padding: 0px;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);

  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

// constant height for charts
const HEIGHT = 300

const TradingViewChart = ({ type = CHART_TYPES.BAR, data, base, baseChange, field, title, width }) => {
  // reference for DOM element to create with chart
  const ref = useRef()

  // pointer to the chart object
  const [chartCreated, setChartCreated] = useState(false)

  // parese the data and format for tardingview consumption
  const formattedData = data?.map(entry => {
    return {
      time: dayjs.unix(entry.date).format('YYYY-MM-DD'),
      value: parseFloat(entry[field])
    }
  })

  // adjust the scale based on the type of chart
  const topScale = type === CHART_TYPES.AREA ? 0.32 : 0.2

  // if no chart created yet, create one with options and add to DOM manually
  useEffect(() => {
    if (!chartCreated && formattedData) {
      var chart = createChart(ref.current, {
        width: width,
        height: HEIGHT,
        layout: {
          backgroundColor: 'transparent'
        },
        rightPriceScale: {
          scaleMargins: {
            top: topScale,
            bottom: 0
          },
          borderVisible: false
        },
        timeScale: {
          borderVisible: false
        },
        grid: {
          horzLines: {
            color: 'rgba(197, 203, 206, 0.5)',
            visible: false
          },
          vertLines: {
            color: 'rgba(197, 203, 206, 0.5)',
            visible: false
          }
        },
        crosshair: {
          horzLine: {
            visible: false,
            labelVisible: false
          },
          vertLine: {
            visible: true,
            style: 0,
            width: 2,
            color: 'rgba(32, 38, 46, 0.1)',
            labelVisible: false
          }
        },
        localization: {
          priceFormatter: val => formattedNum(val, true)
        }
      })

      var series =
        type === CHART_TYPES.BAR
          ? chart.addHistogramSeries({
              color: '#ff007a',
              priceFormat: {
                type: 'volume'
              },
              scaleMargins: {
                top: 0.32,
                bottom: 0
              },
              lineColor: '#ff007a',
              lineWidth: 3
            })
          : chart.addAreaSeries({
              topColor: '#ff007a',
              bottomColor: 'rgba(255, 0, 122, 0)',
              lineColor: '#ff007a',
              lineWidth: 3
            })

      series.setData(formattedData)
      var toolTip = document.createElement('div')
      toolTip.className = 'three-line-legend'
      ref.current.appendChild(toolTip)
      toolTip.style.display = 'block'
      toolTip.style.left = -4 + 'px'
      toolTip.style.top = '-' + 8 + 'px'
      toolTip.style.backgroundColor = 'transparent'

      // format numbers
      let percentChange = baseChange?.toFixed(2)
      let formattedPercentChange = (percentChange > 0 ? '+' : '') + percentChange + '%'
      let color = percentChange >= 0 ? 'green' : 'red'

      // get the title of the chart
      function setLastBarText() {
        toolTip.innerHTML =
          `<div style="font-size: 16px; margin: 4px 0px; color: #20262E;">${title}</div>` +
          '<div style="font-size: 22px; margin: 4px 0px; color: #20262E">' +
          formattedNum(base ?? 0, true) +
          `<span style="margin-left: 10px; font-size: 16px; color: ${color};">${formattedPercentChange}</span>` +
          '</div>'
      }
      setLastBarText()

      // update the title when hovering on the chart
      chart.subscribeCrosshairMove(function(param) {
        if (
          param === undefined ||
          param.time === undefined ||
          param.point.x < 0 ||
          param.point.x > width ||
          param.point.y < 0 ||
          param.point.y > HEIGHT
        ) {
          setLastBarText()
        } else {
          let dateStr = dayjs(param.time.year + '-' + param.time.month + '-' + (param.time.day + 1)).format(
            'MMMM D, YYYY'
          )
          var price = param.seriesPrices.get(series)

          toolTip.innerHTML =
            `<div style="font-size: 16px; margin: 4px 0px; color: #20262E;">${title}</div>` +
            '<div style="font-size: 22px; margin: 4px 0px; color: #20262E">' +
            formattedNum(price, true) +
            '</div>' +
            '<div>' +
            dateStr +
            '</div>'
        }
      })

      setChartCreated(chart)
    }
  }, [base, baseChange, chartCreated, data, formattedData, title, topScale, type, width])

  // responsiveness
  useEffect(() => {
    if (width) {
      chartCreated && chartCreated.resize(width, HEIGHT)
      chartCreated && chartCreated.timeScale().scrollToPosition(0)
    }
  }, [chartCreated, width])

  return (
    <Wrapper>
      <div ref={ref} />
      <IconWrapper>
        <Layout
          onClick={() => {
            chartCreated && chartCreated.timeScale().fitContent()
          }}
        />
      </IconWrapper>
    </Wrapper>
  )
}

export default TradingViewChart
