import { getToken } from "@/app/lib/auth"
import { getHeadquarters } from "@/app/services/energy/enterprise/data"
import { monitoringGraph, monitoringLastThree } from "@/app/services/energy/monitoreo/data"
import { EnergyHeadquarter, SearchParams } from "@/app/type"
import HeadquarterEnergyFilter from "@/app/ui/energia/filters/headquarter-energy-filter"
import ExcessPower from "@/app/ui/energia/monitoreo/excess-power"
import DownloadExcelMonitoreo from "@/app/ui/energia/monitoreo/potencia-excedente/download-excel"
import PowerUsageChart from "@/app/ui/energia/monitoreo/power-dashboard"
import { DatepickerRange } from "@/app/ui/filters/datepicker-range"
import FiltersContainer from "@/app/ui/filters/filters-container"
import { format } from "date-fns"
import { Suspense } from "react"

export const maxDuration = 60

async function MonitoreoContent({ searchParams }: SearchParams) {

  const { headquarter, panel, date_after = new Date(), date_before = new Date(), group_by = 'day' } = await searchParams

  const authToken = await getToken()

  const formattedDateAfter = format(date_after, 'yyyy-MM-dd')
  const formattedDateBefore = format(date_before, 'yyyy-MM-dd')

  const prefetchGraphPromise = headquarter && panel
    ? monitoringGraph({
      headquarterId: String(headquarter),
      panelId: String(panel),
      date_after: formattedDateAfter,
      date_before: formattedDateBefore,
      group_by,
      token: authToken!
    })
    : null

  const prefetchLastThreePromise = headquarter && panel
    ? monitoringLastThree({
      headquarterId: String(headquarter),
      panelId: String(panel),
      token: authToken!
    })
    : null

  const headquarters = await getHeadquarters(authToken!)
  const { results } = headquarters
  const firstHeadquarter = headquarter || results[0].id.toString()
  const selectedHeadquarter = results.find((hq: EnergyHeadquarter) => hq.id === Number(firstHeadquarter)) ?? results[0]
  const selectedPanel = panel || selectedHeadquarter?.electrical_panels?.[0]?.id?.toString() || '1'

  const graphPromise = prefetchGraphPromise ?? monitoringGraph({
    headquarterId: firstHeadquarter,
    panelId: selectedPanel,
    date_after: formattedDateAfter,
    date_before: formattedDateBefore,
    group_by,
    token: authToken!
  })

  const lastThreePromise = prefetchLastThreePromise ?? monitoringLastThree({
    headquarterId: firstHeadquarter,
    panelId: selectedPanel,
    token: authToken!
  })

  const [
    monitoringGraphReadings,
    monitoringLastThreeReadings
  ] = await Promise.all([
    graphPromise,
    lastThreePromise
  ])

  const electricalPanel = selectedHeadquarter?.electrical_panels?.[0]
  const powers = selectedHeadquarter?.powers ?? []

  return (
    <div className="w-full">
      <FiltersContainer>
        <HeadquarterEnergyFilter energyHeadquarter={headquarters.results} energy={firstHeadquarter} />
        <DatepickerRange />
        {/* <DownloadExcelMonitoreo headquarterId={firstHeadquarter} panelId={selectedPanel} /> */}
      </FiltersContainer>
      <div className="w-full px-6">
        <PowerUsageChart readings={monitoringGraphReadings} group={group_by} powers={powers} panel={electricalPanel} />
        <ExcessPower excessPowerData={monitoringLastThreeReadings} panel={electricalPanel} powers={powers} />
      </div>
    </div>
  )
}

function MonitoreoSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="h-12 rounded bg-gray-200" />
      <div className="mt-4 h-64 rounded bg-gray-200" />
      <div className="mt-4 h-48 rounded bg-gray-200" />
    </div>
  )
}

export default async function page({ searchParams }: SearchParams) {
  return (
    <div>
      <Suspense fallback={<MonitoreoSkeleton />}>
        <MonitoreoContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
