import React, { useState, useEffect, useRef } from 'react'
import { createChart, CrosshairMode } from 'lightweight-charts'
import dayjs from 'dayjs'
import { formattedNum } from '../../utils'
import { usePrevious } from 'react-use'

const CandleStickChart = ({ data, width, height = 300, base, valueFormatter = val => formattedNum(val, true) }) => {
  // reference for DOM element to create with chart
  const ref = useRef()

  const formattedData = data?.map(entry => {
    return {
      time: parseFloat(entry.timestamp),
      open: parseFloat(entry.open),
      low: parseFloat(entry.open),
      close: parseFloat(entry.close),
      high: parseFloat(entry.close)
    }
  })

  // pointer to the chart object
  const [chartCreated, setChartCreated] = useState(false)
  const dataPrev = usePrevious(data)

  useEffect(() => {
    if (data !== dataPrev && chartCreated) {
      // remove the tooltip element
      let tooltip = document.getElementById('tooltip-id')
      let node = document.getElementById('test-id')
      node.removeChild(tooltip)
      chartCreated.resize(0, 0)
      setChartCreated()
    }
  }, [chartCreated, data, dataPrev])

  // if no chart created yet, create one with options and add to DOM manually
  useEffect(() => {
    if (!chartCreated) {
      const chart = createChart(ref.current, {
        width: width,
        height: height,
        layout: {
          backgroundColor: 'transparent',
          textColor: 'black'
        },
        grid: {
          vertLines: {
            color: 'rgba(197, 203, 206, 0.5)'
          },
          horzLines: {
            color: 'rgba(197, 203, 206, 0.5)'
          }
        },
        crosshair: {
          mode: CrosshairMode.Normal
        },
        rightPriceScale: {
          borderColor: 'rgba(197, 203, 206, 0.8)'
        },
        timeScale: {
          borderColor: 'rgba(197, 203, 206, 0.8)'
        },
        localization: {
          priceFormatter: val => formattedNum(val)
        }
      })

      var candleSeries = chart.addCandlestickSeries({
        upColor: 'green',
        downColor: 'red',
        borderDownColor: 'red',
        borderUpColor: 'green',
        wickDownColor: 'red',
        wickUpColor: 'green'
      })

      candleSeries.setData(formattedData)

      var toolTip = document.createElement('div')
      toolTip.setAttribute('id', 'tooltip-id')
      toolTip.className = 'three-line-legend'
      ref.current.appendChild(toolTip)
      toolTip.style.display = 'block'
      toolTip.style.left = (base ? 80 : 3) + 'px'
      toolTip.style.top = 50 + 'px'
      toolTip.style.backgroundColor = 'transparent'

      // get the title of the chart
      function setLastBarText() {
        toolTip.innerHTML = base
          ? '<div style="font-size: 22px; margin: 4px 0px; color: #20262E">' + valueFormatter(base) + '</div>'
          : ''
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
          param.point.y > height
        ) {
          setLastBarText()
        } else {
          var price = param.seriesPrices.get(candleSeries).close
          const time = dayjs.unix(param.time).format('MM/DD h:mm A')
          toolTip.innerHTML =
            '<div style="font-size: 22px; margin: 4px 0px; color: #20262E">' +
            valueFormatter(price) +
            '<span style="font-size: 12px; margin: 4px 6px; color: #20262E">' +
            time +
            ' UTC' +
            '</span>' +
            '</div>'
        }
      })

      setChartCreated(chart)
    }
  }, [chartCreated, formattedData, width, height, valueFormatter, base])

  // responsiveness
  useEffect(() => {
    if (width) {
      chartCreated && chartCreated.resize(width, height)
      chartCreated && chartCreated.timeScale().scrollToPosition(0)
    }
  }, [chartCreated, height, width])

  return <div ref={ref} id="test-id" />
}

export default CandleStickChart
