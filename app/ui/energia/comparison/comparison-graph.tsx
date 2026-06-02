'use client'

import React, { useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChartOptions } from 'chart.js'
import { DynamicLine } from '@/components/charts/dynamic-charts'
import { ELECTRIC_PARAMETERS } from '@/app/utils/formatter'

interface DataEntry {
  time: string
  indicator: string
  unit: string
  value: number
  difference: null
  device: string
  measurement_point: string
  unit_cost: string
  value_cost: number
}

interface DateData {
  [date: string]: DataEntry[]
}

const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300']
const HABITUAL_KEY = 'habitual'
const HABITUAL_LABEL = 'Consumo Habitual'
const HABITUAL_COLOR = '#000000'

const generateColor = (index: number): string => {
  if (index < colors.length) return colors[index]
  const hue = (index * 137.508) % 360
  return `hsl(${hue}, 70%, 60%)`
}

const getWeekIndex = (dateStr: string, firstDateStr: string): number => {
  const [y1, m1, d1] = firstDateStr.split('-').map(Number)
  const [y2, m2, d2] = dateStr.split('-').map(Number)
  const first = new Date(Date.UTC(y1, m1 - 1, d1))
  const current = new Date(Date.UTC(y2, m2 - 1, d2))
  const diffMs = current.getTime() - first.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return Math.floor(diffDays / 7)
}

const formatDateInSpanish = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number)
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  const date = new Date(Date.UTC(year, month - 1, day))
  const dayName = days[date.getUTCDay()]
  const dayNum = date.getUTCDate()
  const monthName = months[date.getUTCMonth()]
  return `${dayName}, ${dayNum} de ${monthName}`
}

export default function ComparisonGraph({ mock, category, currentIndicator }: { mock: DateData[], category: string, currentIndicator: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const chartRef = useRef<any>(null)
  const [hiddenDatasets, setHiddenDatasets] = useState<Set<string>>(new Set())
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // React.useEffect(() => {
  //   const handleIndicatorUpdate = () => {
  //     if (indicators.length > 0 && !indicators.includes(currentIndicator)) {
  //       setIsLoading(true)
  //       const params = new URLSearchParams(searchParams.toString())
  //       params.set('indicator', indicators[0])
  //       router.push(`?${params.toString()}`, { scroll: false })
  //     }
  //   }∏

  //   const timeout = setTimeout(handleIndicatorUpdate, 100)
  //   return () => clearTimeout(timeout)
  // }, [category])

  const toggleDataset = (date: string) => {
    if (!hasInteracted) {
      setHasInteracted(true)
      setHiddenDatasets(new Set(dates.filter(d => d !== date)))
    } else {
      setHiddenDatasets(prev => {
        const newSet = new Set(prev)

        if (newSet.has(date)) {
          newSet.delete(date)
        } else {
          const currentlyVisible = dates.length - newSet.size
          if (currentlyVisible > 1) {
            newSet.add(date)
          }
        }
        return newSet
      })
    }
  }

  const transformData = () => {
    const chartData: { time: string;[key: string]: string | number }[] = []

    mock.forEach((dateObj: DateData) => {
      const dateKey = Object.keys(dateObj)[0]
      const entries = dateObj[dateKey]

      entries.forEach((entry: DataEntry, index: number) => {
        console.log('Entry:', entry)
        if (!chartData[index]) {
          chartData[index] = { time: entry.time.split(':').slice(0, 2).join(':') }
        }
        chartData[index][dateKey] = entry.value
      })
    })

    return chartData
  }

  const data = transformData()
  const dates = mock.map(obj => Object.keys(obj)[0])
  const labels = data.map(d => d.time)

  const firstEntry = mock[0]?.[dates[0]]?.[0]
  const costUnitLabel = firstEntry?.unit || '€'

  const firstNonHabitualDate = dates.find(d => d !== HABITUAL_KEY) || dates[0]

  const chartData = {
    labels,
    datasets: dates.map((date) => {
      const isHabitual = date === HABITUAL_KEY
      const weekIndex = isHabitual ? -1 : getWeekIndex(date, firstNonHabitualDate)
      const color = isHabitual ? HABITUAL_COLOR : generateColor(weekIndex)
      return {
        label: date,
        data: data.map(d => d[date] as number),
        borderColor: color,
        backgroundColor: color,
        tension: 0.3,
        hidden: hiddenDatasets.has(date),
        borderWidth: isHabitual ? 6 : 2,
        borderDash: isHabitual ? [5, 5] : undefined,
        pointRadius: 0,
        pointHoverRadius: 4,
        spanGaps: true,
      }
    })
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (items) => {
            return items[0].label || ''
          },
          label: (context) => {
            const costValue = context.parsed.y
            if (costValue === null) return ''
            const dateLabel = context.dataset.label || ''
            const timeLabel = context.label || ''
            const isHabitual = dateLabel === HABITUAL_KEY

            const dateObj = mock.find(d => Object.keys(d)[0] === dateLabel)
            const entry = dateObj?.[dateLabel]?.find(e => e.time.startsWith(timeLabel))
            const costUnit = entry?.unit_cost || ''
            const cost = entry?.value_cost.toFixed(2) || ''
            const energyValue = entry?.value ?? null
            const energyUnit = entry?.unit || ''

            const label = isHabitual
              ? HABITUAL_LABEL
              : formatDateInSpanish(dateLabel)

            // return `${label}: ${costValue.toFixed(2)} ${costUnit} = ${energyValue?.toFixed(2) ?? '--'} KWh`
            return `${label}: ${energyValue?.toFixed(2) ?? '--'} KWh =  ${cost} ${costUnit}`
          },
        },
      },
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x',
        },
        pan: {
          enabled: true,
          mode: 'x',
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Hora',
        },
      },
      y: {
        title: {
          display: true,
          text: costUnitLabel,
        },
      },
    },
    onHover: () => { },
  }

  const handleResetZoom = () => {
    if (chartRef.current) {
      chartRef.current.resetZoom()
    }
  }

  return (
    <div className="w-full h-[600px] p-4 relative">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-70">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-black"></div>
        </div>
      )}
      {/* <div className="flex gap-2 mb-4">
        {indicators.map(indicator => (
          <button
            key={indicator}
            onClick={() => handleIndicatorChange(indicator)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${currentIndicator === indicator
                ? 'bg-black text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            {ELECTRIC_PARAMETERS[indicator as keyof typeof ELECTRIC_PARAMETERS].parameter}
          </button>
        ))}
      </div> */}
      <div className="border rounded-lg p-4 bg-gray-50 shadow-sm">
        <div className="flex flex-wrap gap-4 mb-3">
          {dates.map((date, index) => {
            const isHabitual = date === HABITUAL_KEY
            if (!isHabitual) return null
            return (
              <label
                key={date}
                className="flex items-center gap-2 cursor-pointer px-3 py-2 bg-white rounded-md hover:bg-gray-50 transition-colors"
                style={{ borderColor: HABITUAL_COLOR }}
              >
                <input
                  type="checkbox"
                  checked={!hiddenDatasets.has(date)}
                  onChange={() => toggleDataset(date)}
                  className="w-4 h-4 accent-[#707070]"
                />
                <span
                  className="text-sm text-[#707070] font-bold"
                  style={{ borderBottom: `3px solid ${HABITUAL_COLOR}` }}
                >
                  {HABITUAL_LABEL}
                </span>
              </label>
            )
          })}
        </div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Seleccionar fechas
            </span>
            <button
              onClick={() => {
                setHasInteracted(false)
                setHiddenDatasets(new Set())
              }}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Marcar todos
            </button>
          </div>
          <button
            onClick={handleResetZoom}
            className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
          >
            Reset Zoom
          </button>
        </div>
        <div className="flex flex-wrap gap-4">
          {dates.map((date) => {
            const isHabitual = date === HABITUAL_KEY
            if (isHabitual) return null
            const weekIndex = getWeekIndex(date, firstNonHabitualDate)
            const color = generateColor(weekIndex)
            return (
              <label
                key={date}
                className="flex items-center gap-2 cursor-pointer px-3 py-2 bg-white rounded-md border hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={!hiddenDatasets.has(date)}
                  onChange={() => toggleDataset(date)}
                  className="w-4 h-4 accent-[#707070]"
                />
                <span
                  className="text-sm text-[#707070] font-medium"
                  style={{ borderBottom: `3px solid ${color}` }}
                >
                  {formatDateInSpanish(date)}
                </span>
              </label>
            )
          })}
        </div>
      </div>
      <div className='p-2 mt-2'>
        <p className='text-[#707070] font-bold text-xl'>Gráfica comparativa por días</p>
      </div>
      <div className="mt-6 h-[450px]">
        <DynamicLine ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  )
}
