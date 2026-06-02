"use client"

import { useState, useTransition, useEffect, useRef } from "react"
import { DynamicLine, DynamicBar } from "@/components/charts"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ELECTRIC_PARAMETERS } from "@/app/utils/formatter"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import DeviceReadingsChart from "./measurement-graph"
import NoResultsFound from "../../no-result"

const energyToggleArray = [
  { label: "Hora", value: "none" },
  { label: "Dia", value: "day" },
  { label: "Semana", value: "week" },
  { label: "Mes", value: "month" },
]

interface ReadingGraphItem {
  period: string
  first_reading: string
  last_reading: string
  first_value: number
  last_value: number
  difference: number
  unit?: string
}

interface ReadingsData {
  results?: Array<{
    indicators?: {
      values?: Record<string, unknown>
    }
  }>
}

const SimpleLineChart = ({ readingsGraph, category, indicator, last_by, readings, dateAfter, dateBefore, panelId, headquarterId, measurementPointId, capacity, thresholdLower, thresholdUpper, panelName, measurementPointName, headquarterName }: { readingsGraph: ReadingGraphItem[], category: string, indicator: string, last_by: string, readings: ReadingsData, dateAfter?: string, dateBefore?: string, panelId?: string, headquarterId?: string, measurementPointId?: string, capacity?: string, thresholdLower?: number, thresholdUpper?: number, panelName?: string, measurementPointName?: string, headquarterName?: string }) => {
  const indicatorInfo = ELECTRIC_PARAMETERS[indicator as keyof typeof ELECTRIC_PARAMETERS]
  const indicatorName = indicatorInfo?.parameter || indicator
  const [isPending, startTransition] = useTransition()
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  const lastAlertTime = useRef<Record<string, number>>({})

  useEffect(() => {
    if (category !== 'voltage' || !thresholdLower || !thresholdUpper || !headquarterId || !measurementPointId || !capacity) {
      return
    }

    const checkThresholds = async () => {
      if (!readingsGraph || readingsGraph.length === 0) return

      const latestReading = readingsGraph[readingsGraph.length - 1]
      const currentValue = latestReading.first_value
      const detectedAt = new Date(latestReading.first_reading).toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

      const alertKey = `${measurementPointId}-${Math.floor(Date.now() / 300000)}`
      const now = Date.now()

      if (lastAlertTime.current[alertKey] && now - lastAlertTime.current[alertKey] < 300000) {
        return
      }

      if (currentValue < thresholdLower) {
        lastAlertTime.current[alertKey] = now
        try {
          await fetch('/api/alerts/voltage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              headquarterName: headquarterName || headquarterId,
              headquarterId,
              panelId,
              panelName: panelName || panelId,
              measurementPointId,
              measurementPointName: measurementPointName || measurementPointId,
              capacity,
              currentValue,
              thresholdType: 'inferior',
              thresholdValue: thresholdLower,
              detectedAt,
              indicator,
              indicatorName,
            }),
          })
        } catch (error) {
          console.error('Error sending voltage alert:', error)
        }
      } else if (currentValue > thresholdUpper) {
        lastAlertTime.current[alertKey] = now
        try {
          await fetch('/api/alerts/voltage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              headquarterName: headquarterName || headquarterId,
              headquarterId,
              panelId,
              panelName: panelName || panelId,
              measurementPointId,
              measurementPointName: measurementPointName || measurementPointId,
              capacity,
              currentValue,
              thresholdType: 'superior',
              thresholdValue: thresholdUpper,
              detectedAt,
              indicator,
              indicatorName,
            }),
          })
        } catch (error) {
          console.error('Error sending voltage alert:', error)
        }
      } else if (currentValue > thresholdUpper) {
        lastAlertTime.current[alertKey] = now
        try {
          await fetch('/api/alerts/voltage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              headquarterName: headquarterName || headquarterId,
              headquarterId,
              panelId,
              panelName: panelName || panelId,
              measurementPointId,
              measurementPointName: measurementPointName || measurementPointId,
              capacity,
              currentValue,
              thresholdType: 'superior',
              thresholdValue: thresholdUpper,
              detectedAt,
              indicator,
              indicatorName,
            }),
          })
        } catch (error) {
          console.error('Error sending voltage alert:', error)
        }
      }
    }

    checkThresholds()
  }, [readingsGraph, category, thresholdLower, thresholdUpper, headquarterId, measurementPointId, capacity, panelId, indicator])

  const indicatorsObject = readings?.results?.[0]?.indicators?.values
  const avaibleIndicators = [] as Array<string>

  for (const key in indicatorsObject) {
    if (indicatorsObject[key] !== null) {
      avaibleIndicators.push(key)
    }
  }

  const parameterLabel = ELECTRIC_PARAMETERS[indicator as keyof typeof ELECTRIC_PARAMETERS]?.parameter || indicator

  // Procesar datos para Chart.js
  const processData = (data: ReadingGraphItem[], includeGaps: boolean = false) => {
    if (!data || data.length === 0) return []

    const result = []
    const ONE_MINUTE = 60 * 1000 // 1 minuto en milisegundos
    const TOLERANCE = 30 * 1000 // 30 segundos de tolerancia

    for (let i = 0; i < data.length; i++) {
      const current = data[i]
      result.push({
        x: new Date(current.first_reading).toISOString(),
        y: current.first_value,
      })

      // Solo insertar gaps para gráficos de línea
      if (includeGaps && i < data.length - 1) {
        const next = data[i + 1]
        const currentTime = new Date(current.first_reading).getTime()
        const nextTime = new Date(next.first_reading).getTime()
        const diff = nextTime - currentTime

        // Si la diferencia es mayor a 1 minuto + tolerancia, insertar null
        if (diff > ONE_MINUTE + TOLERANCE) {
          result.push({
            x: new Date(currentTime + 1).toISOString(), // 1ms después para mantener orden
            y: null,
          })
        }
      }
    }

    return result
  }

  // Datos sin gaps para barras, con gaps para líneas
  const dataPointsLine = processData(readingsGraph, true) || []
  const dataPointsBar = processData(readingsGraph, false) || []
  const dataPoints = chartType === 'line' ? dataPointsLine : dataPointsBar

  // Verificar sip todos los valores son cero o null/undefined
  const hasOnlyZeros = dataPoints.length > 0 && dataPoints.every((point: { y: number | null | undefined | string }) =>
    point.y === 0 || point.y === null || point.y === undefined || point.y === ''
  )

  const unit = readingsGraph?.[0]?.unit || ''

  // Determinar si es el mismo día (mostrar solo horas) o rango de fechas
  const isSameDay = dateAfter === dateBefore

  const handleFrequency = (frequency: string) => {
    startTransition(() => {
      const newParams = new URLSearchParams(searchParams)
      newParams.set('last_by', frequency)

      if (frequency === 'none' && category !== 'energy') {
        newParams.delete('last_by')
      } else if (frequency === 'none' && category === 'energy') {
        newParams.set('last_by', 'hour')
      }

      replace(`${pathname}?${newParams.toString()}`, { scroll: false })
    })
  }

  const chartData = {
    datasets: [{
      label: parameterLabel,
      data: dataPoints,
      borderColor: "#00b0c7",
      backgroundColor: chartType === 'line' ? "rgba(0, 176, 199, 0.1)" : "#00b0c7",
      stepped: false,
      tension: 0,
      pointRadius: 0,
      borderWidth: 2,
      spanGaps: chartType === 'line' ? false : undefined,
    }]
  }

  const options: Record<string, unknown> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    scales: {
      x: {
        type: "time",
        adapters: {
          date: {
            locale: es
          }
        },
        time: {
          unit: isSameDay ? "hour" : "day",
          displayFormats: {
            hour: isSameDay ? "HH:mm" : "dd MMM HH:mm",
            day: "dd MMM"
          }
        },
        grid: { color: '#e5e7eb' },
        ticks: { font: { size: 12 } },
        offset: chartType === 'bar',
      },
      y: {
        grid: { color: '#e5e7eb' },
        ticks: {
          font: { size: 12 },
          callback: function (val: number) {
            return `${val.toFixed(0)} ${unit}`
          }
        }
      }
    },
    datasets: {
      bar: {
        barThickness: isSameDay ? 8 : 20,
        maxBarThickness: isSameDay ? 12 : 30,
      }
    },
    plugins: {
      tooltip: {
        backgroundColor: "white",
        titleColor: "#666",
        bodyColor: "#00b0c7",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        bodyFont: { weight: 'bold' },
        callbacks: {
          title: function (tooltipItems: Array<{ parsed: { x: number } }>) {
            const date = new Date(tooltipItems[0].parsed.x)
            const fechaFormateada = format(date, "EEEE d 'de' MMMM, HH:mm", { locale: es })
            return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1)
          },
          label: function (context: { parsed: { y: number } }) {
            return `${parameterLabel}: ${context.parsed.y.toFixed(2)} ${unit}`
          }
        }
      },
      zoom: {
        pan: {
          enabled: true,
          mode: "x",
        },
        zoom: {
          wheel: {
            enabled: true,
            mode: "x",
            speed: 0.1,
          },
          pinch: {
            enabled: true,
          },
          mode: "x",
        },
        limits: {
          y: { min: 'original', max: 'original' },
          x: { min: 'original', max: 'original' }
        }
      },
      annotation: {
        annotations: thresholdLower !== undefined && thresholdUpper !== undefined ? {
          lineLower: {
            type: 'line',
            yMin: thresholdLower,
            yMax: thresholdLower,
            borderColor: '#000',
            borderWidth: 1,
            borderDash: [5, 5],
            label: {
              display: true,
              content: `${thresholdLower.toFixed(0)} V`,
              position: 'start',
              backgroundColor: '#fff',
              color: '#000',
              font: { size: 12 }
            }
          },
          lineUpper: {
            type: 'line',
            yMin: thresholdUpper,
            yMax: thresholdUpper,
            borderColor: '#000',
            borderWidth: 1,
            borderDash: [5, 5],
            label: {
              display: true,
              content: `${thresholdUpper.toFixed(0)} V`,
              position: 'start',
              backgroundColor: '#fff',
              color: '#000',
              font: { size: 12 }
            }
          }
        } : {}
      },
      legend: {
        display: false
      }
    }
  }

  return (
    <div className="w-full min-h-full p-4 bg-white flex flex-col justify-center items-center relative">
      <div className="pb-4 mb-4">
        {avaibleIndicators?.length > 0 && (
          <h2 className="font-semibold text-xl">
            Grafica de {parameterLabel}
          </h2>
        )}
      </div>

      {readingsGraph?.length > 0 && !hasOnlyZeros && (
        <div className="flex flex-col gap-4 mb-4">
          <ToggleGroup
            type="single"
            value={last_by}
            onValueChange={handleFrequency}
            aria-label="Frequency"
            className="flex gap-2"
          >
            {category === 'energy' && (
              energyToggleArray.map(times => (
                <ToggleGroupItem
                  key={times.value}
                  value={times.value}
                  className={`w-[120px] h-[40px] ${times.value === last_by
                    ? 'bg-[#00b0c7] text-white'
                    : 'bg-gray-100 text-black'
                    } ${last_by === 'hour' && times.value === 'none' ? 'bg-[#00b0c7] text-white' : ''}`}
                >
                  {isPending ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                    </div>
                  ) : (
                    times.label
                  )}
                </ToggleGroupItem>
              ))
            )}
          </ToggleGroup>

          {category === 'power' && (
            <ToggleGroup
              type="single"
              value={chartType}
              onValueChange={(value) => setChartType(value as 'line' | 'bar')}
              aria-label="Chart Type"
              className="flex gap-2"
            >
              <ToggleGroupItem
                value="line"
                className={`w-[120px] h-[40px] ${chartType === 'line'
                  ? 'bg-[#00b0c7] text-white'
                  : 'bg-gray-100 text-black'
                  }`}
              >
                Linea
              </ToggleGroupItem>
              <ToggleGroupItem
                value="bar"
                className={`w-[120px] h-[40px] ${chartType === 'bar'
                  ? 'bg-[#00b0c7] text-white'
                  : 'bg-gray-100 text-black'
                  }`}
              >
                Barras
              </ToggleGroupItem>
            </ToggleGroup>
          )}
        </div>
      )}

      {avaibleIndicators?.length === 0 ? (
        <NoResultsFound message="Aun no hay informacion disponible" />
      ) : hasOnlyZeros ? (
        <NoResultsFound message="Sin consumo registrado" />
      ) : (
        <>
          {last_by === 'minute' ? (
            <div className="w-full h-[350px]">
              {dataPoints.length > 0 ? (
                chartType === 'line' ? (
                  <DynamicLine data={chartData} options={options} />
                ) : (
                  <DynamicBar data={chartData} options={options} />
                )
              ) : (
                <NoResultsFound message="Aun no hay informacion disponible" />
              )}
            </div>
          ) : (
            <DeviceReadingsChart data={readingsGraph} last_by={last_by} />
          )}
        </>
      )}
    </div>
  )
}

export default SimpleLineChart
