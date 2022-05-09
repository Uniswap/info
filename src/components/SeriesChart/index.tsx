import { IconWrapper } from 'components'
import dayjs from 'dayjs'
import { createChart, IChartApi, ISeriesApi, MouseEventParams, SeriesType, SingleValueData } from 'lightweight-charts'
import { useEffect, useRef } from 'react'
import { Play } from 'react-feather'
import { useAppSelector } from 'state/hooks'
import Percent from 'components/Percent'
import { formattedNum } from 'utils'
import { Wrapper, ChartInfo, Title, ChartInfoPrice, ChartInfoDate } from './styled'

interface ISeriesChart {
  data: SingleValueData[]
  type: SeriesType
  base: number
  baseChange: number
  title: string
}

export const SeriesChart = ({ data, type, base, baseChange, title }: ISeriesChart) => {
  const darkMode = useAppSelector(state => state.user.darkMode)
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi>()
  const seriesRef = useRef<ISeriesApi<'Area' | 'Histogram'>>()
  const basePriceRef = useRef<HTMLParagraphElement>(null)
  const chartPriceRef = useRef<HTMLParagraphElement>(null)
  const chartDateRef = useRef<HTMLParagraphElement>(null)
  const textColor = darkMode ? 'rgb(165, 172, 183)' : '#45484D'

  useEffect(() => {
    const width = chartContainerRef.current!.clientWidth
    const height = 300
    chartRef.current = createChart(chartContainerRef.current!, {
      width,
      height,
      layout: {
        backgroundColor: 'transparent',
        textColor: textColor
      },
      rightPriceScale: {
        scaleMargins: {
          top: type === 'Area' ? 0.32 : 0.2,
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
        priceFormatter: (val: number) => formattedNum(val, true)
      }
    })
    const chart = chartRef.current

    switch (type) {
      case 'Area':
        seriesRef.current = chart.addAreaSeries({
          topColor: '#2E69BB',
          bottomColor: 'rgba(255, 255, 255, 0)',
          lineColor: '#2E69BB',
          lineWidth: 1
        })
        break
      case 'Histogram':
      default:
        seriesRef.current = chart.addHistogramSeries({
          color: '#2E69BB',
          priceFormat: {
            type: 'volume'
          },
          scaleMargins: {
            top: 0.32,
            bottom: 0
          },
          baseLineColor: '#2E69BB',
          baseLineWidth: 1
        })
        break
    }
    seriesRef.current.setData(data)

    const callback = (param: MouseEventParams) => {
      if (!param.time) {
        basePriceRef.current!.style.display = 'block'
        chartPriceRef.current!.innerText = ''
        chartDateRef.current!.innerText = ''
      } else {
        if (chartPriceRef.current && chartDateRef.current) {
          basePriceRef.current!.style.display = 'none'
          if (typeof param.time === 'object') {
            const dateStr = dayjs(param.time.year + '-' + param.time.month + '-' + param.time.day).format(
              'MMMM D, YYYY'
            )
            const price = param.seriesPrices.get(seriesRef.current!)?.toString()
            chartPriceRef.current!.innerText = formattedNum(price, true).toString()
            chartDateRef.current!.innerText = dateStr
          }
        }
      }
    }
    chartRef.current?.subscribeCrosshairMove(callback)

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current!.clientWidth })
    }

    window.addEventListener('resize', handleResize)

    chart.timeScale().fitContent()

    return () => {
      window.removeEventListener('resize', handleResize)

      chart.unsubscribeCrosshairMove(callback)
      chart.remove()
    }
  }, [])

  useEffect(() => {
    if (seriesRef.current && chartRef.current) {
      seriesRef.current.setData(data)
      chartRef.current.timeScale().fitContent()
    }
  }, [data])

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.applyOptions({
        layout: {
          textColor
        }
      })
    }
  }, [darkMode])

  return (
    <Wrapper>
      <div ref={chartContainerRef}>
        <ChartInfo>
          <Title>{type === 'Histogram' ? `${title}(24h)` : title}</Title>
          <div ref={basePriceRef}>
            <ChartInfoPrice>{formattedNum(base ?? 0, true)}</ChartInfoPrice> <Percent percent={baseChange} />
          </div>
          <ChartInfoPrice ref={chartPriceRef} />
          <ChartInfoDate ref={chartDateRef} />
        </ChartInfo>
      </div>
      <IconWrapper>
        <Play
          onClick={() => {
            chartRef.current?.timeScale().fitContent()
          }}
        />
      </IconWrapper>
    </Wrapper>
  )
}
