"use client"

import { useTransition, useMemo } from "react"
import { format } from "date-fns"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import NoResultFound from "../../no-result-found"
import { DynamicLine } from "@/components/charts"
import { es } from 'date-fns/locale'
import { capitalizeFirstLetter } from "@/app/utils/func"
import ContractedPowerSidebar from "./contracted-power-sidebar"

interface DeviceInfo {
  id: number
  name: string
  dev_eui: string
}

interface MeasurementPoint {
  id: number
  measurement_point_name: string
  power: number
  power_avg?: number
  power_peak?: number
}

interface PowerReading {
  created_at: string
  device: DeviceInfo
  values_per_channel: MeasurementPoint[]
  unit: string
}

interface Powers {
  id: number
  power_installed: number
  power_contracted: number
  power_max: number
}

interface PowerThresholds {
  power_max: number | null
  power_contracted: number | null
  power_installed: number | null
}

interface MonitoringResponse {
  power_thresholds: PowerThresholds
  results: PowerReading[]
}

interface Thread {
  id: number
  name: string
  type: string
}

interface Panel {
  id: number
  name: string
  is_active: boolean
  type: "monofasico"
  threads: Thread[] | null
}

export default function PowerUsageChart({ readings, group, powers, panel }: { readings: MonitoringResponse, group?: string, powers: Powers[], panel?: Panel }) {


  const { power_contracted, power_max, power_installed } = readings?.power_thresholds ?? {}
  const results = readings?.results ?? []

  const [isPending, startTransition] = useTransition()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  const dataPoints = results?.map((item: PowerReading) => ({
    x: new Date(item?.created_at).toISOString(),
    y: item.values_per_channel?.[0].power,
  })) || []

  const dataPointsAvg = results?.map((item: PowerReading) => ({
    x: new Date(item?.created_at).toISOString(),
    y: item.values_per_channel?.[0].power_avg,
  })) || []

  const dataPointsPeak = results?.map((item: PowerReading) => ({
    x: new Date(item?.created_at).toISOString(),
    y: item.values_per_channel?.[0].power_peak,
  })) || []

  const handleGroupChange = (group: string) => {
    startTransition(() => {
      const newParams = new URLSearchParams(searchParams)

      newParams.set('group_by', 'day')

      if (group) {
        newParams.set('group_by', group)
      }

      replace(`${pathname}?${newParams.toString()}`, { scroll: false })
    })
  }

  const isDayMode = group === 'day'
  const measurementPointName = results?.[0]?.values_per_channel?.[0]?.measurement_point_name

  const data = {
    datasets: isDayMode
      ? [
        {
          label: `Potencia promedio - ${measurementPointName}`,
          data: dataPointsAvg,
          fill: false,
          borderColor: "#00b0c7",
          stepped: false,
          tension: 0,
          pointRadius: 0,
        },
        {
          label: `Potencia máxima - ${measurementPointName}`,
          data: dataPointsPeak,
          fill: false,
          borderColor: "#EF4444",
          stepped: false,
          tension: 0,
          pointRadius: 0,
        },
      ]
      : [
        {
          label: measurementPointName,
          data: dataPoints,
          fill: false,
          borderColor: "#00b0c7",
          stepped: false,
          tension: 0,
          pointRadius: 0,
        },
      ],
  }

  const isHourMode = group === 'minute'

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    },
    scales: {
      x: {
        type: "time" as const,
        time: isHourMode
          ? { unit: 'hour' as const, displayFormats: { hour: 'HH:mm' as const } }
          : { unit: "day" as const },
        title: {
          display: false,
          text: "Hora de Lectura",
        },
        grid: {
          color: '#e5e7eb'
        },
      },
      y: {
        grid: {
          color: '#e5e7eb'
        },
        ticks: {
          display: true,
          callback: function (val: string | number) {
            return `${val} kW`
          },
        }
      },
    },
    plugins: {
      tooltip: {
        backgroundColor: "white",
        titleColor: "#666",
        bodyColor: "#00b0c7",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          title: function (tooltipItems: any[]) {
            if (!tooltipItems?.[0]?.parsed?.x) return ''
            const date = new Date(tooltipItems[0].parsed.x)
            const dateFormatted = isHourMode
              ? capitalizeFirstLetter(format(date, "EEEE d 'de' MMMM, HH:mm", { locale: es }))
              : capitalizeFirstLetter(format(date, "EEEE d 'de' MMMM", { locale: es }))
            return dateFormatted
          },
          label: function (context: any) {
            let label = context.dataset.label || ""
            if (label) {
              label += ": "
            }
            label += context.parsed.y.toFixed(2) + ' ' + results?.[0]?.unit
            return label
          },
          labelColor: function (context: any) {
            return {
              borderColor: context.dataset.borderColor,
              backgroundColor: context.dataset.borderColor,
            }
          },
        },
      },
      zoom: {
        pan: {
          enabled: true,
          mode: "x" as const,
        },
        zoom: {
          wheel: {
            enabled: true,
            mode: "x" as const,
            speed: 0.1,
            threshold: 2,
          },
          pinch: {
            enabled: true,
          },
          mode: "x" as const,
        },
        limits: {
          y: { min: 'original' as const, max: 'original' as const },
          x: { min: 'original' as const, max: 'original' as const }
        }
      },
      annotation: {
        annotations: {
          line1: {
            type: 'line' as const,
            display: power_max ? true : false,
            yMin: power_max ?? undefined,
            yMax: power_max ?? undefined,
            borderColor: '#d9c308',
            borderWidth: 2,
            borderDash: [5, 5] as [number, number],
            label: {
              display: true,
              color: 'white',
              backgroundColor: '#d9c308',
              content: ['Máxima demanda de potencia'],
            }
          },
          line2: {
            type: 'line' as const,
            display: power_contracted ? true : false,
            yMin: power_contracted ?? undefined,
            yMax: power_contracted ?? undefined,
            borderColor: 'orange',
            borderWidth: 2,
            borderDash: [5, 5] as [number, number],
            label: {
              display: true,
              color: 'white',
              backgroundColor: 'orange',
              content: ['Potencia contratada'],
            }
          }
        }
      },
      decimation: {
        enabled: true,
        algorithm: 'lttb' as const,
        samples: 20,
        threshold: 5
      },
      legend: {
        display: false
      }
    }
  }), [isHourMode, power_max, power_contracted, results])

  console.log({
    power_installed,
    power_max,
    power_contracted
  })
  return (
    <div className="w-full p-6">
      <div className="flex justify-end">
        <ToggleGroup type="single" className="relative" onValueChange={handleGroupChange} defaultValue={group}>
          {isPending && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-md z-10">
              <span className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></span>
            </div>
          )}
          <ToggleGroupItem value="minute" aria-label="minute">
            <p>Hora</p>
          </ToggleGroupItem>
          <ToggleGroupItem value="day" aria-label="day">
            <p>Día</p>
          </ToggleGroupItem>

        </ToggleGroup>
      </div>
      <div className="flex gap-4">
        <div id="RANGO-HORA-PUNTA" className="w-[400px] shrink-0">
          <div className="w-full max-w-xs mx-auto">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
              <div className="flex flex-col items-center justify-center space-y-3">
                <p className="text-xl font-semibold">Rango de hora punta</p>
                <div className="flex items-center gap-4">
                  <p className="text-lg font-medium">18:00 a 23:00</p>
                  <div className="w-4 h-4 rounded-full bg-red-600" />
                </div>
              </div>
            </div>
          </div>
          <ContractedPowerSidebar panel={panel!} powers={powers} power_installed={power_installed} power_max={power_max} power_contracted={power_contracted} />
        </div>
        <div className="flex-1 h-[740px] w-full min-w-0 flex justify-center items-center">
          {
            results?.length > 0 ? (
              <DynamicLine data={data} options={options} />
            ) : (
              <NoResultFound />
            )
          }
        </div>
      </div>
    </div>
  )
}
