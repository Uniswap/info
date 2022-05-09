import { IconWrapper } from 'components'
import dayjs from 'dayjs'
import { createChart, IChartApi, ISeriesApi, MouseEventParams, SeriesType, SingleValueData } from 'lightweight-charts'
import { useEffect, useRef, useState } from 'react'
import { Play } from 'react-feather'
import { useAppSelector } from 'state/hooks'
import Percent from 'components/Percent'
import { formattedNum } from 'utils'
import { Wrapper, ChartInfo, Title, ChartInfoPrice, ChartInfoDate } from './styled'
import { EthereumNetworkInfo, SupportedNetwork, TronNetworkInfo } from 'constants/networks'
import { useActiveNetworkId } from 'state/features/application/selectors'
import { useTheme } from 'styled-components'

interface ISeriesChart {
  data: SingleValueData[]
  type: SeriesType
  base: number
  baseChange: number
  title: string
}

type CurrentDayData = {
  price: string
  date: string
}

const chartColors = {
  [SupportedNetwork.ETHEREUM]: {
    area: {
      topColor: EthereumNetworkInfo.primaryColor,
      bottomColor: 'rgba(41, 116, 255, 0.28)'
    },
    histogram: {
      color: EthereumNetworkInfo.primaryColor,
      baseLineColor: EthereumNetworkInfo.primaryColor
    }
  },
  [SupportedNetwork.TRON]: {
    area: {
      topColor: TronNetworkInfo.primaryColor,
      bottomColor: 'rgba(241, 50, 60, 0.157)'
    },
    histogram: {
      color: TronNetworkInfo.primaryColor,
      baseLineColor: TronNetworkInfo.primaryColor
    }
  }
}

export const SeriesChart = ({ data, type, base, baseChange, title }: ISeriesChart) => {
  const theme = useTheme()
  const darkMode = useAppSelector(state => state.user.darkMode)
  const activeNetwork = useActiveNetworkId()
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi>()
  const seriesRef = useRef<ISeriesApi<'Area' | 'Histogram'>>()
  const [currentDayData, setCurrentDayData] = useState<CurrentDayData | undefined>()
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
          topColor: chartColors[activeNetwork].area.topColor,
          bottomColor: chartColors[activeNetwork].area.bottomColor,
          lineColor: chartColors[activeNetwork].area.topColor,
          crosshairMarkerBorderColor: 'white',
          lineWidth: 2
        })
        break
      case 'Histogram':
      default:
        seriesRef.current = chart.addHistogramSeries({
          color: chartColors[activeNetwork].histogram.color,
          priceFormat: {
            type: 'volume'
          },
          scaleMargins: {
            top: 0.32,
            bottom: 0
          },
          baseLineColor: chartColors[activeNetwork].histogram.color,
          baseLineWidth: 2
        })
        break
    }
    seriesRef.current.setData(data)

    const chartScrollCallback = (param: MouseEventParams) => {
      if (param.time) {
        const dateStr =
          typeof param.time === 'object'
            ? dayjs(param.time.year + '-' + param.time.month + '-' + param.time.day).format('MMMM D, YYYY')
            : ''
        const price = param.seriesPrices.get(seriesRef.current!)?.toString()
        setCurrentDayData({
          price: formattedNum(price, true).toString(),
          date: dateStr
        })
      } else {
        setCurrentDayData(undefined)
      }
    }

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current!.clientWidth })
    }

    chartRef.current?.subscribeCrosshairMove(chartScrollCallback)
    window.addEventListener('resize', handleResize)
    chart.timeScale().fitContent()

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.unsubscribeCrosshairMove(chartScrollCallback)
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
    chartRef.current?.applyOptions({
      layout: {
        textColor
      },
      crosshair: {
        vertLine: {
          color: theme.text4
        }
      }
    })
    switch (type) {
      case 'Area':
        seriesRef.current?.applyOptions({
          topColor: chartColors[activeNetwork].area.topColor,
          bottomColor: chartColors[activeNetwork].area.bottomColor,
          lineColor: chartColors[activeNetwork].area.topColor
        })
        break
      case 'Histogram':
      default:
        seriesRef.current?.applyOptions({
          color: chartColors[activeNetwork].histogram.color,
          baseLineColor: chartColors[activeNetwork].histogram.color
        })
        break
    }
  }, [darkMode, activeNetwork])

  return (
    <Wrapper>
      <div ref={chartContainerRef}>
        <ChartInfo>
          <Title>{type === 'Histogram' ? `${title}(24h)` : title}</Title>
          {currentDayData ? (
            <>
              <ChartInfoPrice>{currentDayData.price}</ChartInfoPrice>
              <ChartInfoDate>{currentDayData.date}</ChartInfoDate>
            </>
          ) : (
            <div>
              <ChartInfoPrice>{formattedNum(base ?? 0, true)}</ChartInfoPrice> <Percent percent={baseChange} />
            </div>
          )}
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
