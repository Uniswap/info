import React, { useState, useEffect, useRef } from 'react'
import { createChart, CrosshairMode } from 'lightweight-charts'
import dayjs from 'dayjs'
import { formattedNum } from '../../utils'
import { usePrevious } from 'react-use'
import styled from 'styled-components'
import { Play } from 'react-feather'
import { useDarkModeManager } from '../../contexts/LocalStorage'
import useTheme from '../../hooks/useTheme'

const IconWrapper = styled.div`
  position: absolute;
  right: 10px;
  color: ${({ theme }) => theme.text1};
  border-radius: 3px;
  height: 16px;
  width: 16px;
  padding: 0px;
  bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;

  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

const CandleStickChart = ({ data, width, height = 300, base, valueFormatter = val => formattedNum(val, true) }) => {
  // reference for DOM element to create with chart
  const ref = useRef()

  const formattedData = data?.map(entry => {
    return {
      time: parseFloat(entry.timestamp),
      open: parseFloat(entry.open),
      low: parseFloat(entry.open),
      close: parseFloat(entry.close),
      high: parseFloat(entry.close),
    }
  })

  if (formattedData && formattedData.length > 0) {
    formattedData.push({
      time: dayjs().unix(),
      open: parseFloat(formattedData[formattedData.length - 1].close),
      close: parseFloat(base),
      low: Math.min(parseFloat(base), parseFloat(formattedData[formattedData.length - 1].close)),
      high: Math.max(parseFloat(base), parseFloat(formattedData[formattedData.length - 1].close)),
    })
  }

  // pointer to the chart object
  const [chartCreated, setChartCreated] = useState(false)
  const dataPrev = usePrevious(data)

  const [darkMode] = useDarkModeManager()
  const textColor = darkMode ? 'white' : 'black'
  const theme = useTheme()
  const previousTheme = usePrevious(darkMode)

  // reset the chart if theme switches
  useEffect(() => {
    if (chartCreated && previousTheme !== darkMode) {
      // remove the tooltip element
      let tooltip = document.getElementById('tooltip-id')
      let node = document.getElementById('test-id')
      node.removeChild(tooltip)
      chartCreated.resize(0, 0)
      setChartCreated()
    }
  }, [chartCreated, darkMode, previousTheme])

  useEffect(() => {
    if (data !== dataPrev && chartCreated) {
      // remove the tooltip element
      let tooltip = document.getElementById('tooltip-id')
      let currentChart = document.getElementsByClassName('tv-lightweight-charts')
      let node = document.getElementById('test-id')
      node.removeChild(tooltip)
      if (currentChart.length > 0) {
        node.removeChild(currentChart[0])
      }
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
          textColor: textColor,
        },
        grid: {
          vertLines: {
            color: darkMode ? '#40505A4d' : '#C2C2C233',
          },
          horzLines: {
            color: darkMode ? '#40505A4d' : '#C2C2C233',
          },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
        rightPriceScale: {
          borderColor: 'rgba(197, 203, 206, 0.8)',
          visible: true,
        },
        timeScale: {
          borderColor: 'rgba(197, 203, 206, 0.8)',
        },
        localization: {
          priceFormatter: val => formattedNum(val, true),
        },
      })

      var candleSeries = chart.addCandlestickSeries({
        upColor: '#31CB9E',
        downColor: '#FF537B',
        borderDownColor: '#FF537B',
        borderUpColor: '#31CB9E',
        wickDownColor: '#FF537B',
        wickUpColor: '#31CB9E',
      })

      candleSeries.setData(formattedData)

      var toolTip = document.createElement('div')
      toolTip.setAttribute('id', 'tooltip-id')
      toolTip.className = 'three-line-legend'
      ref.current.appendChild(toolTip)
      toolTip.style.display = 'block'
      toolTip.style.top = '48px'
      toolTip.style.left = '0.75rem'
      toolTip.style.backgroundColor = 'transparent'

      // get the title of the chart
      function setLastBarText() {
        toolTip.innerHTML = base
          ? `<div style="font-size: 22px; margin: 4px 0px; color: ${textColor}">` + valueFormatter(base) + '</div>'
          : ''
      }
      setLastBarText()

      // update the title when hovering on the chart
      chart.subscribeCrosshairMove(function (param) {
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
          const time = dayjs.unix(param.time).format('MM/DD h:mm:ss A')
          toolTip.innerHTML =
            `<div style="font-size: 22px; margin: 4px 0px; color: ${theme.text}">` +
            valueFormatter(price) +
            `<span style="font-size: 12px; margin: 4px 6px; color: ${theme.subText}">` +
            time +
            ' UTC' +
            '</span>' +
            '</div>'
        }
      })

      chart.timeScale().fitContent()

      setChartCreated(chart)
    }
  }, [theme.subText, theme.text, chartCreated, formattedData, width, height, valueFormatter, base, textColor, darkMode])

  // responsiveness
  useEffect(() => {
    if (width) {
      chartCreated && chartCreated.resize(width, height)
      chartCreated && chartCreated.timeScale().scrollToPosition(0)
    }
  }, [chartCreated, height, width])

  return (
    <>
      <div ref={ref} id='test-id' />
      <IconWrapper>
        <Play
          onClick={() => {
            chartCreated && chartCreated.timeScale().fitContent()
          }}
        />
      </IconWrapper>
    </>
  )
}

export default CandleStickChart
