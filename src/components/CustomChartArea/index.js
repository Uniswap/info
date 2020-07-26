import React, { useState, useEffect, useRef } from 'react'

import { createChart } from 'lightweight-charts'
import dayjs from 'dayjs'
import { formattedNum } from '../../utils'

const CustomChartArea = ({ data, base, baseChange }) => {
  const ref = useRef()

  var width = 400
  var height = 300

  const [chartCreated, setChartCreated] = useState(false)

  const formattedData = data?.map(entry => {
    return {
      time: dayjs.unix(entry.date).format('YYYY-MM-DD'),
      value: parseFloat(entry.totalLiquidityUSD)
    }
  })

  useEffect(() => {
    if (!chartCreated && formattedData) {
      setChartCreated(true)
      var chart = createChart(ref.current, {
        width: width,
        height: height,
        rightPriceScale: {
          scaleMargins: {
            top: 0.35,
            bottom: 0.2
          },
          borderVisible: false
        },
        timeScale: {
          borderVisible: false
        },
        grid: {
          horzLines: {
            color: '#eee',
            visible: false
          },
          vertLines: {
            color: '#ffffff'
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
        }
      })

      var series = chart.addAreaSeries({
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
      toolTip.style.left = 3 + 'px'
      toolTip.style.top = 3 + 'px'

      let percentChange = baseChange?.toFixed(2)
      let formattedPercentChange = (percentChange > 0 ? '+' : '-') + percentChange + '%'

      function setLastBarText() {
        var dateStr =
          formattedData[formattedData.length - 1].time.year +
          ' - ' +
          formattedData[formattedData.length - 1].time.month +
          ' - ' +
          formattedData[formattedData.length - 1].time.day
        toolTip.innerHTML =
          '<div style="font-size: 16px; margin: 4px 0px; color: #20262E;">Liquidity</div>' +
          '<div style="font-size: 22px; margin: 4px 0px; color: #20262E">' +
          formattedNum(base, true) +
          `<span style="margin-left: 10px; font-size: 16px; color: green;">${formattedPercentChange}</span>` +
          '</div>' +
          '<div>' +
          dateStr +
          '</div>'
      }
      setLastBarText()
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
          let dateStr = param.time.year + ' - ' + param.time.month + ' - ' + param.time.day
          var price = param.seriesPrices.get(series)

          toolTip.innerHTML =
            '<div style="font-size: 16px; margin: 4px 0px; color: #20262E; ">Liquidity </div>' +
            '<div style="font-size: 22px; margin: 4px 0px; color: #20262E">' +
            formattedNum(price, true) +
            '</div>' +
            '<div>' +
            dateStr +
            '</div>'
        }
      })
    }
  }, [base, baseChange, chartCreated, data, formattedData, height, width])

  return <div ref={ref} />
}

export default CustomChartArea
