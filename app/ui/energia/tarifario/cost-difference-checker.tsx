'use client'

import { Card } from '@/components/ui/card'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React from 'react'
import NoResultsFound from '../../no-result'
import { DollarSign, Zap } from 'lucide-react'
import { format, subMonths, startOfMonth, endOfMonth, parseISO, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { CalendarIcon } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'

export type CalculatorDifferenceResult = {
  month: string
  year: number
  detail?: string
  consumption?: {
    total: number
    peak: number
    off_peak: number,
    unit: string
  }
  cost?: {
    total: number
    peak: number
    off_peak: number
    unit: string
  }
  first_value?: number
  last_value?: number
  date_first_value?: string
  date_last_value?: string
  date_range: {
    start: string
    end: string
  }
}

interface CostDifferenceCheckerProps {
  firstCalculatorResultMonthly?: CalculatorDifferenceResult
  secondCalculatorResultMonthly?: CalculatorDifferenceResult
  formattedDateAfter1?: string
  formattedDateBefore1?: string
  formattedDateAfter2?: string
  formattedDateBefore2?: string
}

interface DatePickerRangeLocalProps {
  startParam: string
  endParam: string
  className?: string
  defaultFrom?: Date
  defaultTo?: Date
}

function parseISOorUndefined(s?: string | null): Date | undefined {
  if (!s) return undefined
  const t = Date.parse(s)
  return isNaN(t) ? undefined : new Date(t)
}

function formatNumberWithCommas(num?: number): string {
  if (num === undefined || num === null) return '0'
  return num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function DatePickerRangeLocal({ startParam, endParam, className, defaultFrom, defaultTo }: DatePickerRangeLocalProps) {
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams as unknown as string)
  const pathname = usePathname()
  const { replace } = useRouter()
  const [isPending, startTransition] = React.useTransition()

  const start = params.get(startParam)
  const end = params.get(endParam)

  const [fecha, setFecha] = React.useState<DateRange | undefined>({
    from: parseISOorUndefined(start) || defaultFrom,
    to: parseISOorUndefined(end) || defaultTo,
  })

  React.useEffect(() => {
    const newFrom = parseISOorUndefined(start) || defaultFrom
    const newTo = parseISOorUndefined(end) || defaultTo

    setFecha((prev) => {
      const prevFromISO = prev?.from?.toISOString()
      const prevToISO = prev?.to?.toISOString()
      const newFromISO = newFrom?.toISOString()
      const newToISO = newTo?.toISOString()

      if (prevFromISO === newFromISO && prevToISO === newToISO) {
        return prev
      }
      return { from: newFrom, to: newTo }
    })
  }, [start, end, defaultFrom, defaultTo])

  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  React.useEffect(() => {
    const nextParams = new URLSearchParams(searchParams?.toString() ?? "")
    if (fecha?.from || fecha?.to) {
      nextParams.delete("page")
    }
    clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      if (fecha?.from) {
        nextParams.set(startParam, format(fecha.from, 'yyyy-MM-dd'))
      } else {
        nextParams.delete(startParam)
      }

      if (fecha?.to) {
        nextParams.set(endParam, format(fecha.to, 'yyyy-MM-dd'))
      } else {
        nextParams.delete(endParam)
      }

      const nextQuery = nextParams.toString()
      const currentQuery = searchParams?.toString() ?? ""

      if (nextQuery !== currentQuery) {
        startTransition(() => {
          replace(`${pathname}?${nextQuery}`, { scroll: false })
        })
      }
    }, 500)

    return () => {
      clearTimeout(debounceRef.current)
    }
  }, [fecha, startParam, endParam, searchParams, pathname, replace])

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="fecha"
            variant="outline"
            className={cn(
              " justify-start text-left font-normal relative w-auto",
              !fecha?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {fecha?.from ? (
              fecha.to ? (
                <>
                  {format(fecha.from, "d MMMM, yyyy", { locale: es })} -{" "}
                  {format(fecha.to, "d MMMM, yyyy", { locale: es })}
                </>
              ) : (
                format(fecha.from, "d MMMM, yyyy", { locale: es })
              )
            ) : (
              <span>Selecciona un rango</span>
            )}

            {isPending && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black" />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={fecha?.from}
            selected={fecha}
            onSelect={setFecha}
            numberOfMonths={2}
            locale={es}
            className="rounded-lg border shadow-sm"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

function ResultCard({ result, label }: { result?: CalculatorDifferenceResult, label: string }) {

  return (
    <Card className="p-4 border-[1px] justify-center h-auto text-xl">
      {
        result?.detail ? (
          <NoResultsFound message="No se encontraron lecturas para este período." />
        ) : (
          <div className="flex flex-row gap-4 w-full items-center">
            <div className="flex-1 space-y-2">
              <div className="bg-[#F5F6F9] p-3 rounded-lg">
                <p className="text-xl font-bold text-[#4D5A63] text-center pb-2">{formatNumberWithCommas(result?.consumption?.total)} {result?.consumption?.unit}</p>
                <p className="text-[10px] text-[#4D5A63] -mt-1">
                  Punta: {formatNumberWithCommas(result?.consumption?.peak)} {result?.consumption?.unit}
                </p>
                <p className="text-[10px] text-[#4D5A63] -mt-3">  Fuera de Punta: {formatNumberWithCommas(result?.consumption?.off_peak)} {result?.consumption?.unit}</p>
              </div>
            </div>
            <div className="flex items-center px-2">
              <span className="text-2xl font-bold text-[#4D5A63]">=</span>
            </div>
            <div className="flex-1 space-y-2">
              <div className="bg-destructive/10 p-3 rounded-lg leading-0">
                <p className="text-xl font-bold text-destructive text-center pb-2">{result?.cost?.unit}{formatNumberWithCommas(result?.cost?.total)}</p>
                <p className="text-[10px] text-destructive -mt-1">
                  Punta: {result?.cost?.unit}{formatNumberWithCommas(result?.cost?.peak)}
                </p>
                <p className="text-[10px] text-destructive -mt-3">  Fuera de Punta: {result?.cost?.unit}{formatNumberWithCommas(result?.cost?.off_peak)}</p>
              </div>
            </div>
          </div>
        )
      }
    </Card>
  )
}

export default function CostDifferenceChecker({
  firstCalculatorResultMonthly,
  secondCalculatorResultMonthly,
  formattedDateAfter1,
  formattedDateBefore1,
  formattedDateAfter2,
  formattedDateBefore2
}: CostDifferenceCheckerProps) {

  const today = new Date()
  const previousMonthDate = subMonths(today, 1)

  const defaultDateAfter1 = startOfMonth(previousMonthDate)
  const defaultDateBefore1 = endOfMonth(previousMonthDate)
  const defaultDateAfter2 = startOfMonth(today)
  const defaultDateBefore2 = today


  console.log(firstCalculatorResultMonthly)

  const firstCost = firstCalculatorResultMonthly?.cost?.total ?? 0
  const secondCost = secondCalculatorResultMonthly?.cost?.total ?? 0
  const costDifference = secondCost - firstCost

  let greeting = ""
  let messageText = ""
  let messageColor = ""
  let showDefaultMessage = false

  if (formattedDateAfter1 && formattedDateBefore1 && formattedDateAfter2 && formattedDateBefore2) {
    const daysRange1 = differenceInDays(parseISO(formattedDateBefore1), parseISO(formattedDateAfter1))
    const daysRange2 = differenceInDays(parseISO(formattedDateBefore2), parseISO(formattedDateAfter2))

    if (daysRange1 === daysRange2) {
      if (costDifference < 0) {
        greeting = "¡FELICIDADES!"
        messageText = `Has ahorrado ${firstCalculatorResultMonthly?.cost?.unit}${formatNumberWithCommas(Math.abs(costDifference))}`
        messageColor = "text-green-600"
      } else if (costDifference === 0) {
        greeting = "¡FELICIDADES!"
        messageText = `Has mantenido tu consumo estable en ${firstCalculatorResultMonthly?.cost?.unit}${formatNumberWithCommas(firstCost)}`
        messageColor = "text-[#00b0c7]"
      } else {
        greeting = "¡OH NO!"
        messageText = `Tu consumo se ha excedido en ${firstCalculatorResultMonthly?.cost?.unit}${formatNumberWithCommas(costDifference)}`
        messageColor = "text-[#EF4444]"
      }
    } else {
      showDefaultMessage = true
    }
  }

  return (
    <div>
      <div className="flex gap-4 items-stretch">
        <div className="flex-1">
          <DatePickerRangeLocal
            startParam="date_after_1"
            endParam="date_before_1"
            className="mb-2"
            defaultFrom={defaultDateAfter1}
            defaultTo={defaultDateBefore1}
          />
          <ResultCard result={firstCalculatorResultMonthly} label="Consumo de energía" />
        </div>
        <div className='flex justify-center items-center font-bold text-[#4D5A63] text-2xl'>
          VS
        </div>
        <div className="flex-1">
          <DatePickerRangeLocal
            startParam="date_after_2"
            endParam="date_before_2"
            className="mb-2"
            defaultFrom={defaultDateAfter2}
            defaultTo={defaultDateBefore2}
          />
          <ResultCard result={secondCalculatorResultMonthly} label="Consumo de energía" />
        </div>
      </div>
      {(greeting || showDefaultMessage) && (
        <div className="mt-4 border rounded-lg p-3 text-center">
          {showDefaultMessage ? (
            <p className="text-sm text-gray-500"><span className='font-bold'>¿QUIERES VER TU AHORRO REAL?</span>  Compara periodos con la misma cantidad de días</p>
          ) : (
            <p className="text-sm font-bold">
              <span>{greeting}</span>
              <span className={`${messageColor} ml-1`}>{messageText}</span>
            </p>
          )}
        </div>
      )}
    </div>
  )
}