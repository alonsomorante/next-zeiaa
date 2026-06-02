import { getEnergyMeasurementPointPanels } from '@/app/services/energy/enterprise/data'
import { getHeadquarters, getMeasurementPoints } from '@/app/services/filters/data'
import { consumeGraph, dashboardTable, porcentageGraph } from '@/app/services/panel/data'
import { EnergyHeadquarter, MeasurementPointResults, SearchParams } from '@/app/type'
import { VoltageByDay } from '@/app/utils/thresholds'
import HeadquarterEnergyFilter from '@/app/ui/energia/filters/headquarter-energy-filter'
import BarChart from '@/app/ui/energia/panel/bar-chart'
import ChartComponent from '@/app/ui/energia/panel/chart'
import PanelViewWrapper from '@/app/ui/energia/panel/panel-view-wrapper'
import FiltersContainer from "@/app/ui/filters/filters-container"
import MeasurementPointFilter from "@/app/ui/filters/measurement-points-filter"
import MonthFilter from "@/app/ui/filters/month-filter"
import YearFilter from "@/app/ui/filters/year-filter"
import PeriodPickerFilter from "@/app/ui/filters/period-picker-filter"
import { format } from "date-fns"
import React, { Suspense } from "react"
import { getToken } from "@/app/lib/auth"
import PanelsFilterEnergy, { ElectricalPanel } from "@/app/ui/energia/filters/panels-energy-filter"
import IndicatorEnergyFilter from "@/app/ui/filters/indicator-energy-filter"
import NoResultsFound from "@/app/ui/no-result"

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
}

function getLastDayOfMonth(year: number, month: number): number {
  const daysInMonth: { [key: number]: number } = {
    1: 31,
    2: isLeapYear(year) ? 29 : 28,
    3: 31,
    4: 30,
    5: 31,
    6: 30,
    7: 31,
    8: 31,
    9: 30,
    10: 31,
    11: 30,
    12: 31,
  }
  return daysInMonth[month]
}

function getMonthDateRange(year: number, month: number): string {
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
  const lastDay = getLastDayOfMonth(year, month)
  const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`
  return `${startDate}:${endDate}`
}

interface PanelContext {
  authToken: string
  weekday: string
  this_month?: string
  this_week?: string
  selectedYear: number
  selectedIndicador: string
  firstHeadquarter: string
  firstPanel: string
  firstPoint: string
  formattedDateAfter?: string
  formattedDateBefore?: string
  start: string
  finish: string
  headquarters: { results: EnergyHeadquarter[] }
  measurementPointsPanels: { results: ElectricalPanel[] }
  measurementPoints: MeasurementPointResults
  hasData: boolean
  errorMessage?: string
}

async function resolvePanelContext(searchParams: SearchParams['searchParams']): Promise<PanelContext> {
  const {
    headquarter,
    panel,
    point,
    weekday = '1,2,3,4,5',
    date_start,
    date_end,
    date_after,
    date_before,
    this_month,
    this_week,
    year,
    indicador
  } = await searchParams

  const authToken = await getToken()
  const currentYear = new Date().getFullYear()
  const selectedYear = year ? parseInt(year, 10) : currentYear
  const currentMonth = new Date().getMonth() + 1
  const defaultMonthRange = getMonthDateRange(selectedYear, currentMonth)
  const [defaultStart, defaultFinish] = defaultMonthRange.split(':')
  const formattedDateAfter = date_after ? format(date_after, 'yyyy-MM-dd') : undefined
  const formattedDateBefore = date_before ? format(date_before, 'yyyy-MM-dd') : undefined
  const start = date_start || defaultStart
  const finish = date_end || defaultFinish

  const headquartersPromise = getHeadquarters(authToken!)
  const headquarters = await headquartersPromise

  if (headquarters?.results?.length === 0) {
    return {
      authToken: authToken!,
      weekday,
      this_month,
      this_week,
      selectedYear,
      selectedIndicador: indicador || 'EPpos',
      firstHeadquarter: '',
      firstPanel: '',
      firstPoint: '',
      formattedDateAfter,
      formattedDateBefore,
      start,
      finish,
      headquarters: { results: [] },
      measurementPointsPanels: { results: [] },
      measurementPoints: { results: [] },
      hasData: false,
      errorMessage: 'No hay sedes disponibles'
    }
  }

  const firstHeadquarter = headquarter || headquarters.results[0].id.toString()
  const measurementPointsPanels = await getEnergyMeasurementPointPanels({
    headquarterId: firstHeadquarter,
    token: authToken!
  })

  if (measurementPointsPanels?.results?.length === 0) {
    return {
      authToken: authToken!,
      weekday,
      this_month,
      this_week,
      selectedYear,
      selectedIndicador: indicador || 'EPpos',
      firstHeadquarter,
      firstPanel: '',
      firstPoint: '',
      formattedDateAfter,
      formattedDateBefore,
      start,
      finish,
      headquarters,
      measurementPointsPanels: { results: [] },
      measurementPoints: { results: [] },
      hasData: false,
      errorMessage: 'No hay paneles disponibles'
    }
  }

  const firstPanel = panel || measurementPointsPanels?.results[0]?.id.toString()

  const measurementPoints: MeasurementPointResults = await getMeasurementPoints({
    electricalpanelId: firstPanel,
    token: authToken!
  })

  if (measurementPointsPanels?.results?.length === 0) {
    return {
      authToken: authToken!,
      weekday,
      this_month,
      this_week,
      selectedYear,
      selectedIndicador: indicador || 'EPpos',
      firstHeadquarter,
      firstPanel,
      firstPoint: '',
      formattedDateAfter,
      formattedDateBefore,
      start,
      finish,
      headquarters,
      measurementPointsPanels,
      measurementPoints: { results: [] },
      hasData: false,
      errorMessage: 'No hay puntos de medición disponibles'
    }
  }

  const firstPoint = point || measurementPoints?.results?.[0].measurement_points?.[0]?.id.toString()
  const selectedIndicador = indicador || 'EPpos'

  return {
    authToken: authToken!,
    weekday,
    this_month,
    this_week,
    selectedYear,
    selectedIndicador,
    firstHeadquarter,
    firstPanel,
    firstPoint,
    formattedDateAfter,
    formattedDateBefore,
    start,
    finish,
    headquarters,
    measurementPointsPanels,
    measurementPoints,
    hasData: true,
  }
}

async function PanelFiltersSection({ contextPromise }: { contextPromise: Promise<PanelContext> }) {
  const context = await contextPromise

  if (!context.hasData) {
    return (
      <div className="p-6">
        <NoResultsFound message={context.errorMessage || "No hay datos disponibles"} />
      </div>
    )
  }

  return (
    <FiltersContainer>
      <PanelsFilterEnergy energyPanels={context.measurementPointsPanels.results} panel={context.firstPanel} />
      <HeadquarterEnergyFilter energyHeadquarter={context.headquarters.results} energy={context.firstHeadquarter} />
    </FiltersContainer>
  )
}

async function PanelMainSection({ contextPromise }: { contextPromise: Promise<PanelContext> }) {
  const context = await contextPromise

  if (!context.hasData) {
    return (
      <div className="p-6">
        <NoResultsFound message={context.errorMessage || "No hay datos disponibles"} />
      </div>
    )
  }

  const [dashboardTableReadings, dashboardPorcentageGraph, consumeGraphReadings] = await Promise.all([
    dashboardTable({
      headquarterId: context.firstHeadquarter,
      token: context.authToken,
      date_after: context.formattedDateAfter,
      date_before: context.formattedDateBefore,
      point: context.firstPoint,
      panelId: context.firstPanel
    }),
    porcentageGraph({
      headquarterId: context.firstHeadquarter,
      this_month: context.this_month,
      this_week: context.this_week,
      date_after: context.formattedDateAfter,
      date_before: context.formattedDateBefore,
      panelId: context.firstPanel,
      token: context.authToken
    }),
    consumeGraph({
      date_after: context.start,
      date_before: context.finish,
      headquarterId: context.firstHeadquarter,
      indicador: context.selectedIndicador,
      panelId: context.firstPanel,
      point: context.firstPoint,
      last_by: 'day',
      weekday: context.weekday,
      token: context.authToken
    })
  ])


  const thresholds = context.measurementPoints?.results[0]?.measurement_points?.find((mp) =>
    mp.id === Number(context.firstPoint)
  )?.energy_thresholds?.thresholds_values as VoltageByDay | undefined

  return (
    <>
      <ChartComponent electricalPanelData={dashboardPorcentageGraph} />
      <PanelViewWrapper readings={dashboardTableReadings} />
      <div className='w-full'>
        <div className='flex justify-between gap-4'>
          <div className='flex flex-col gap-4 px-4'>
            <div className='flex items-end justify-end relative gap-2'>
              <YearFilter year={context.selectedYear.toString()} />
              <MonthFilter year={context.selectedYear.toString()} />
            </div>
            <div className='flex justify-between items-center gap-4'>
              <PeriodPickerFilter weekday={context.weekday} />
              <div className='flex gap-2'>
                <PanelsFilterEnergy energyPanels={context.measurementPointsPanels.results} panel={context.firstPanel} />
                <MeasurementPointFilter measurementPoints={context.measurementPoints} point={context.firstPoint} />
                <IndicatorEnergyFilter indicador={context.selectedIndicador} />
              </div>
            </div>
          </div>
        </div>
        <div className='w-[80%] flex justify-center items-center m-auto'>
          <BarChart readingsGraph={consumeGraphReadings} weekday={context.weekday} thresholds={thresholds} />
        </div>
      </div>
    </>
  )
}

// Skeleton de carga
function DashboardSkeleton() {
  return (
    <div className="relative p-6 flex flex-col justify-center gap-8">
      {/* Filtros skeleton */}
      <div className="h-12 bg-gray-200 rounded animate-pulse"></div>

      {/* Banner de alerta skeleton */}
      <div className="h-16 bg-gray-200 rounded animate-pulse"></div>

      {/* Gráficos y tabla skeleton */}
      <div className='w-full flex gap-8 justify-between'>
        <div className="flex-1 h-64 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex-1 h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Gráfico de barras skeleton */}
      <div className='w-full'>
        <div className='flex justify-between gap-4 mb-4'>
          <div className='flex flex-col gap-2'>
            <div className="h-6 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-80 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className='flex flex-col gap-4 px-4'>
            <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
            <div className='flex gap-4'>
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-48 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className='w-[80%] h-[740px] bg-gray-200 rounded animate-pulse m-auto'></div>
      </div>
    </div>
  )
}

// Componente de página principal
export default function Page({ searchParams }: SearchParams) {
  const contextPromise = resolvePanelContext(searchParams)

  return (
    <div className="relative p-6 flex flex-col justify-center gap-8">
      <Suspense fallback={<div className="h-12 bg-gray-200 rounded animate-pulse" />}>
        <PanelFiltersSection contextPromise={contextPromise} />
      </Suspense>
      <Suspense fallback={<DashboardSkeleton />}>
        <PanelMainSection contextPromise={contextPromise} />
      </Suspense>
    </div>
  )
}
