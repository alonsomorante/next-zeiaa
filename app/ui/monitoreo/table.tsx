'use client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
// import { INDICATOR_CONVERTED, UNIT_CONVERTED } from "@/app/utils/formatter"
// import { Indicator, Unit } from "@/app/type"
// import { formattedDate } from "@/app/utils/func"
import NoResultFound from "../no-result-found"
// import { useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"
import { useRoom } from "@/app/utils/func"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { INDICATOR_CONVERTED, UNIT_CONVERTED } from "@/app/utils/formatter"

interface IndicatorStructure {
  indicator: string,
  value: string,
  unit: string,
  status: string,
  hours: string,
  date: string
}

// interface TableComponentProps {
//   data: IndicatorStructure[],
//   name: string,
//   devUI: string,
//   room?: string,
//   status: string
// }



// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function TableComponent({ data }: any) {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  const newParams = new URLSearchParams(searchParams);

  const [checkedRoom, setCheckedRoom] = useState<number>()

  const filterData = data.filter((item: IndicatorStructure) => item.indicator !== 'PIR' && item.indicator !== 'LUX')

  const { changeRoom } = useRoom()


  const checkedChangeFn = (roomId: number) => {
    newParams.set('room', roomId.toString())

    changeRoom(String(roomId))
    setCheckedRoom(roomId)

    replace(`${pathname}?${newParams.toString()}`, { scroll: false })


  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Resumen de indicadores<br /><span className="text-sm font-normal text-gray-500">Datos por agente, en tiempo real</span></CardTitle>
      </CardHeader>
      {
        filterData.length === 0 ? (
          <NoResultFound />
        ) : (
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {/* <TableHead className="w-[100px]">Indicador</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead className="text-right">Valor</TableHead> */}
                  <TableHead>Sala monitoreada</TableHead>
                  {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    data[0].indicators.map((indicator: any) => {
                      return (
                        <TableHead key={indicator.indicator}>
                          {INDICATOR_CONVERTED[indicator.indicator as keyof typeof INDICATOR_CONVERTED]}
                        </TableHead>
                      )
                    })
                  }
                  <TableHead className="text-balance">
                    Activar umbral
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* {
                  filterData?.map((indicator, i) => {
                    return (
                      <TableRow key={i} onClick={() => router.push(`/ocupacional/dashboard/analisis/indicadores?indicator=${indicator.indicator}&unit=${indicator.unit}`)} className="cursor-pointer">
                        <TableCell className="font-normal">{INDICATOR_CONVERTED[indicator.indicator as Indicator]}</TableCell>
                        <TableCell className="font-normal">{formattedDate(indicator.date)}</TableCell>
                        <TableCell className="font-normal">{indicator.hours.toLocaleLowerCase()}</TableCell>
                        <TableCell className="font-normal text-right text-nowrap">{indicator.value} {UNIT_CONVERTED[indicator.unit as Unit]}</TableCell>
                      </TableRow>
                    )
                  }

                  )
                } */}
                {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  data.map((room: any) => {
                    return (
                      <TableRow key={room.id}>
                        <TableCell>{room.name}</TableCell>
                        {
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          room.indicators.map((indicator: any) => {
                            return (
                              <TableCell key={indicator.indicator}>
                                {indicator.value} {UNIT_CONVERTED[indicator.unit as keyof typeof UNIT_CONVERTED]}
                              </TableCell>
                            )
                          })
                        }
                        <TableCell>
                          <Switch checked={checkedRoom === room.id} onCheckedChange={() => checkedChangeFn(room.id)} />
                        </TableCell>
                      </TableRow>
                    )
                  })
                }
              </TableBody>
            </Table>
          </CardContent>
        )
      }

    </Card>
  )
}
