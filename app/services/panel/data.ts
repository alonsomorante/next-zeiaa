'use server'
import { fetchWithAuthEnergy } from "@/app/lib/api"
import { baseUrlEnergy } from "@/app/lib/constant"
import { cacheLife } from 'next/cache'
import { cache } from 'react'

const dashboardTableCached = cache(async (headquarterId: string, panelId: string, date_after?: string, date_before?: string, unit?: string, category?: string, point?: string, token?: string) => {
  'use cache'
  cacheLife('minutes')

  const url = new URL(`/api/v1/headquarter/${headquarterId}/electrical_panel/${panelId}/devices/measurement-points/list/`, baseUrlEnergy)

  url.searchParams.set('page_size', '1000')

  if (date_after) url.searchParams.set('date_after', date_after)
  if (date_before) url.searchParams.set('date_before', date_before)
  if (unit) url.searchParams.set('unit', unit)
  if (category) url.searchParams.set('category', category)
  if (point) url.searchParams.set('point', point)

  const res = await fetchWithAuthEnergy(`${url.pathname}${url.search}`, {}, token)

  return res
})

const porcentageGraphCached = cache(async (headquarterId: string, panelId: string, this_week?: string, this_month?: string, date_after?: string, date_before?: string, token?: string) => {
  'use cache'
  cacheLife('minutes')

  const url = new URL(`/api/v1/headquarter/${headquarterId}/electrical_panel/${panelId}/consumption-distribution/`, baseUrlEnergy)

  if (this_week) url.searchParams.set('this_week', this_week)
  if (this_month) url.searchParams.set('this_month', this_month)
  if (date_after) url.searchParams.set('date_after', date_after)
  if (date_before) url.searchParams.set('date_before', date_before)

  const res = await fetchWithAuthEnergy(`${url.pathname}${url.search}`, {}, token)

  return res
})

const consumeGraphCached = cache(async (headquarterId: string, panelId: string, date_after?: string, date_before?: string, indicador?: string, unit?: string, last_by?: string, category?: string, point?: string, weekday?: string, token?: string) => {
  'use cache'
  cacheLife('minutes')

  const url = new URL(`/api/v1/headquarter/${headquarterId}/electrical_panel/${panelId}/measurement_points/${point}/readings/graph`, baseUrlEnergy)

  if (date_after) url.searchParams.set('date_after', date_after)
  if (date_before) url.searchParams.set('date_before', date_before)
  if (indicador) url.searchParams.set('indicador', indicador)
  if (unit) url.searchParams.set('unit', unit)
  if (last_by) url.searchParams.set('last_by', last_by)
  if (category) url.searchParams.set('category', category)
  if (point) url.searchParams.set('point', point)
  if (weekday) url.searchParams.set('weekday', weekday)


  console.log(`${url.pathname}${url.search}`)

  const res = await fetchWithAuthEnergy(`${url.pathname}${url.search}`, {}, token)

  return res
})

const dashboardTableAlertsCached = cache(async (headquarterId: string, date_after?: string, date_before?: string, unit?: string, page?: string, category?: string, point?: string, token?: string) => {
  'use cache'
  cacheLife('seconds')

  const url = new URL(`/api/v1/headquarter/${headquarterId}/measurement-point/${point}/historical-alerts`, baseUrlEnergy)

  if (date_after) url.searchParams.set('date_after', date_after)
  if (date_before) url.searchParams.set('date_before', date_before)
  if (unit) url.searchParams.set('unit', unit)
  if (page) url.searchParams.set('page', page)
  if (category) url.searchParams.set('category', category)
  if (point) url.searchParams.set('point', point)

  const res = await fetchWithAuthEnergy(`${url.pathname}${url.search}`, {}, token)

  return res
})

export async function dashboardTable({ headquarterId, panelId, date_after, date_before, unit, category, point, token }: { date_after?: string, date_before?: string, panelId?: string, headquarterId?: string, unit?: string, category?: string, point?: string, token: string }) {
  return await dashboardTableCached(headquarterId!, panelId!, date_after, date_before, unit, category, point, token)
}

export async function porcentageGraph({ headquarterId, panelId, this_week, this_month, date_after, date_before, token }: { headquarterId: string, panelId: string, this_week?: string, this_month?: string, date_after?: string, date_before?: string, token: string }) {
  return await porcentageGraphCached(headquarterId, panelId, this_week, this_month, date_after, date_before, token)
}

export async function consumeGraph({ headquarterId, panelId, date_after, date_before, indicador, unit, last_by, category, point, weekday, token }: { date_after?: string, date_before?: string, panelId?: string, headquarterId?: string, indicador?: string, unit?: string, last_by?: string, category?: string, point?: string, weekday: string, token: string }) {
  return await consumeGraphCached(headquarterId!, panelId!, date_after, date_before, indicador, unit, last_by, category, point, weekday, token)
}

export async function dashboardTableAlerts({ headquarterId, date_after, date_before, unit, page, category, point, token }: { date_after?: string, date_before?: string, panelId?: string, headquarterId?: string, unit?: string, page?: string, category?: string, point?: string, token?: string }) {
  return await dashboardTableAlertsCached(headquarterId!, date_after, date_before, unit, page, category, point, token)
}
