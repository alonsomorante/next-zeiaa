'use client'
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import IndicatorToggle from "../filters/indicators-toggle";
// import PaginationNumberComponent from '../pagination-number';
import { Wind, Calendar, Clock } from 'lucide-react'
import { GeneralRoomData, Indicator, Readings } from "@/app/type";
// import { INDICATOR_CONVERTED, STATUS_TO_SPANISH, UNIT_CONVERTED } from "@/app/utils/formatter";
// import { formattedDate } from "@/app/utils/func";
import NoResultFound from "../no-result-found";
import { UNIT_CONVERTED } from "@/app/utils/formatter";

type TableComponentProps = {
  indicator: Indicator
  generalRoomData: GeneralRoomData,
  readings: Readings
}

interface Level {
  level: string
  value: number
}

interface RoomStatusData {
  name: string
  unit: string
  levels: Level[]
}




interface MeasurementCardProps {
  humidity?: number
  date?: string
  time?: string
  status?: string
}

export function MeasurementCard({
  humidity = 75.5,
  date = "Miércoles 5 de noviembre",
  time = "09:56 am",
  status = "(Máximo permitido)",
}: MeasurementCardProps) {
  return (
    <div className="relative flex w-full max-w-[350px] flex-col items-center rounded-xl bg-white pb-8 pt-12 shadow-xl px-6">
      {/* Badge de estado superior */}
      <div className="absolute -top-5 left-1/2 w-auto -translate-x-1/2 transform  rounded-full bg-[#00B2C2] px-6 py-2 text-sm font-bold text-white shadow-sm">
        {status}
      </div>

      <div className="flex w-full flex-col space-y-4">
        {/* Humedad */}
        <div className="flex items-center gap-3 text-slate-600">
          <Wind className="h-5 w-5 text-slate-400" />
          <span className="font-medium">Humedad: {humidity} %</span>
        </div>

        {/* Fecha */}
        <div className="flex items-center gap-3 text-slate-600">
          <Calendar className="h-5 w-5 text-slate-400" />
          <span className="font-medium capitalize">{date}</span>
        </div>

        {/* Hora */}
        <div className="flex items-center gap-3 text-slate-600">
          <Clock className="h-5 w-5 text-slate-400" />
          <span className="font-medium">{time}</span>
        </div>
      </div>
    </div>
  )
}

const ROOM_THRESHOLDS = {
  CO2: [
    {
      "name": "Sala UPS",
      "unit": "PPM",
      "levels": [
        {
          "level": "GOOD",
          "value": 600
        },
        {
          "level": "MODERATE",
          "value": 800
        },
        {
          "level": "UNHEALTHY",
          "value": 1000
        },
        {
          "level": "DANGEROUS",
          "value": 1500
        },
        {
          "level": "CRITICAL",
          "value": 2500
        }
      ]
    },
    {
      "name": "Sala de Operaciones 1",
      "unit": "PPM",
      "levels": [
        {
          "level": "GOOD",
          "value": 600
        },
        {
          "level": "MODERATE",
          "value": 800
        },
        {
          "level": "UNHEALTHY",
          "value": 1000
        },
        {
          "level": "DANGEROUS",
          "value": 1500
        },
        {
          "level": "CRITICAL",
          "value": 2500
        }
      ]
    },
    {
      "name": "Sala técnica",
      "unit": "PPM",
      "levels": [
        {
          "level": "GOOD",
          "value": 600
        },
        {
          "level": "MODERATE",
          "value": 800
        },
        {
          "level": "UNHEALTHY",
          "value": 1000
        },
        {
          "level": "DANGEROUS",
          "value": 1500
        },
        {
          "level": "CRITICAL",
          "value": 2500
        }
      ]
    },
    {
      "name": "Sala de Operaciones 2",
      "unit": "PPM",
      "levels": [
        {
          "level": "GOOD",
          "value": 600
        },
        {
          "level": "MODERATE",
          "value": 800
        },
        {
          "level": "UNHEALTHY",
          "value": 1000
        },
        {
          "level": "DANGEROUS",
          "value": 1500
        },
        {
          "level": "CRITICAL",
          "value": 2500
        }
      ]
    },
    {
      "name": "Sala de tomografía",
      "unit": "PPM",
      "levels": [
        {
          "level": "GOOD",
          "value": 600
        },
        {
          "level": "MODERATE",
          "value": 800
        },
        {
          "level": "UNHEALTHY",
          "value": 1000
        },
        {
          "level": "DANGEROUS",
          "value": 1500
        },
        {
          "level": "CRITICAL",
          "value": 2500
        }
      ]
    },
    {
      "name": "Sala de Operaciones 3",
      "unit": "PPM",
      "levels": [
        {
          "level": "GOOD",
          "value": 600
        },
        {
          "level": "MODERATE",
          "value": 800
        },
        {
          "level": "UNHEALTHY",
          "value": 1000
        },
        {
          "level": "DANGEROUS",
          "value": 1500
        },
        {
          "level": "CRITICAL",
          "value": 2500
        }
      ]
    },
    {
      "name": "Sala de Operaciones 4",
      "unit": "PPM",
      "levels": [
        {
          "level": "GOOD",
          "value": 600
        },
        {
          "level": "MODERATE",
          "value": 800
        },
        {
          "level": "UNHEALTHY",
          "value": 1000
        },
        {
          "level": "DANGEROUS",
          "value": 1500
        },
        {
          "level": "CRITICAL",
          "value": 2500
        }
      ]
    },
    {
      "name": "Subestación eléctrica",
      "unit": "PPM",
      "levels": [
        {
          "level": "GOOD",
          "value": 600
        },
        {
          "level": "MODERATE",
          "value": 800
        },
        {
          "level": "UNHEALTHY",
          "value": 1000
        },
        {
          "level": "DANGEROUS",
          "value": 1500
        },
        {
          "level": "CRITICAL",
          "value": 2500
        }
      ]
    }
  ],
  TEMPERATURE: [
    {
      "name": "Sala UPS",
      "unit": "CELSIUS",
      "levels": [
        {
          "level": "MÍNIMO PERMITIDO",
          "value": 18
        },
        {
          "level": "MÁXIMO PERMITIDO",
          "value": 25
        }
      ]
    },
    {
      "name": "Sala de Operaciones 1",
      "unit": "CELSIUS",
      "levels": [
        {
          "level": "MÍNIMO PERMITIDO",
          "value": 20
        },
        {
          "level": "MÁXIMO PERMITIDO",
          "value": 24
        }
      ]
    },
    {
      "name": "Sala técnica",
      "unit": "CELSIUS",
      "levels": [
        {
          "level": "MÍNIMO PERMITIDO",
          "value": 18
        },
        {
          "level": "MÁXIMO PERMITIDO",
          "value": 25
        }
      ]
    },
    {
      "name": "Sala de Operaciones 2",
      "unit": "CELSIUS",
      "levels": [
        {
          "level": "MÍNIMO PERMITIDO",
          "value": 20
        },
        {
          "level": "MÁXIMO PERMITIDO",
          "value": 24
        }
      ]
    },
    {
      "name": "Sala de tomografía",
      "unit": "CELSIUS",
      "levels": [
        {
          "level": "MÍNIMO PERMITIDO",
          "value": 20
        },
        {
          "level": "MÁXIMO PERMITIDO",
          "value": 24
        }
      ]
    },
    {
      "name": "Sala de Operaciones 3",
      "unit": "CELSIUS",
      "levels": [
        {
          "level": "MÍNIMO PERMITIDO",
          "value": 20
        },
        {
          "level": "MÁXIMO PERMITIDO",
          "value": 24
        }
      ]
    },
    {
      "name": "Sala de Operaciones 4",
      "unit": "CELSIUS",
      "levels": [
        {
          "level": "MÍNIMO PERMITIDO",
          "value": 20
        },
        {
          "level": "MÁXIMO PERMITIDO",
          "value": 24
        }
      ]
    },
    {
      "name": "Subestación eléctrica",
      "unit": "CELSIUS",
      "levels": [
        {
          "level": "MÍNIMO PERMITIDO",
          "value": 15
        },
        {
          "level": "MÁXIMO PERMITIDO",
          "value": 28
        }
      ]
    }
  ],
  HUMIDITY: [
    {
      "name": "Sala UPS",
      "unit": "PERCENT",
      "levels": [
        {
          "level": "MÍNIMO PERMITIDO",
          "value": 35
        },
        {
          "level": "MÁXIMO PERMITIDO",
          "value": 55
        }
      ]
    },
    {
      "name": "Sala de Operaciones 1",
      "unit": "PERCENT",
      "levels": [
        {
          "level": "MÍNIMO PERMITIDO",
          "value": 40
        },
        {
          "level": "MÁXIMO PERMITIDO",
          "value": 60
        }
      ]
    },
    {
      "name": "Sala técnica",
      "unit": "PERCENT",
      "levels": [
        {
          "level": "MÍNIMO PERMITIDO",
          "value": 35
        },
        {
          "level": "MÁXIMO PERMITIDO",
          "value": 55
        }
      ]
    },
    {
      "name": "Sala de Operaciones 2",
      "unit": "PERCENT",
      "levels": [
        {
          "level": "MÍNIMO PERMITIDO",
          "value": 40
        },
        {
          "level": "MÁXIMO PERMITIDO",
          "value": 60
        }
      ]
    },
    {
      "name": "Sala de tomografía",
      "unit": "PERCENT",
      "levels": [
        {
          "level": "MÍNIMO PERMITIDO",
          "value": 40
        },
        {
          "level": "MÁXIMO PERMITIDO",
          "value": 60
        }
      ]
    },
    {
      "name": "Sala de Operaciones 3",
      "unit": "PERCENT",
      "levels": [
        {
          "level": "MÍNIMO PERMITIDO",
          "value": 40
        },
        {
          "level": "MÁXIMO PERMITIDO",
          "value": 60
        }
      ]
    },
    {
      "name": "Sala de Operaciones 4",
      "unit": "PERCENT",
      "levels": [
        {
          "level": "MÍNIMO PERMITIDO",
          "value": 40
        },
        {
          "level": "MÁXIMO PERMITIDO",
          "value": 60
        }
      ]
    },
    {
      "name": "Subestación eléctrica",
      "unit": "PERCENT",
      "levels": [
        {
          "level": "MÍNIMO PERMITIDO",
          "value": 30
        },
        {
          "level": "MÁXIMO PERMITIDO",
          "value": 50
        }
      ]
    }
  ]
};

interface RoomStatusCardProps {
  data: RoomStatusData
}

const TRANSLATE = {
  GOOD: 'Bueno',
  MODERATE: 'Moderado',
  UNHEALTHY: 'Insalubre',
  DANGEROUS: 'Peligroso',
  CRITICAL: 'Crítico',
  "MÍNIMO PERMITIDO": "MÍNIMO PERMITIDO",
  "MÁXIMO PERMITIDO": "MÁXIMO PERMITIDO"
}

export function RoomStatusCard({ data }: RoomStatusCardProps) {

  const getLevelColor = (levelName: string) => {
    const lowerName = levelName.toLowerCase()
    if (lowerName.includes("máximo") || lowerName.includes("max")) return "text-amber-300"
    if (lowerName.includes("mínimo") || lowerName.includes("min")) return "text-rose-300"
    return "text-slate-500"
  }

  return (
    <div className="relative flex w-full max-w-[300px] flex-col justify-center rounded-xl bg-white p-6 shadow-sm">
      <h3 className="mb-6 text-lg font-bold text-slate-900">{data.name}</h3>

      <div className="space-y-4">
        {data.levels.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className={`font-medium ${getLevelColor(item.level)}`}>
              {/* Formatting the label to be Title Case or just displaying as is. 
                  The JSON has "MÍNIMO PERMITIDO", let's make it look a bit nicer or keep as is. 
                  I'll display it as is but maybe capitalize first letter if needed, 
                  but for now direct display is safest. */}
              {TRANSLATE[item.level as keyof typeof TRANSLATE]}:
            </span>
            <span className="font-bold text-slate-900">{item.value} {UNIT_CONVERTED[data.unit as keyof typeof UNIT_CONVERTED]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}


export default function TableComponent({ generalRoomData, readings, indicator }: TableComponentProps) {

  const { indicators_pollutants: indicators } = generalRoomData

  // const th = generalRoomData?.thresholds[indicator].levels

  const TH = ROOM_THRESHOLDS[indicator as keyof typeof ROOM_THRESHOLDS]

  // const colorByLever = {
  //   GOOD: "bg-green-600",
  //   UNHEALTHY: "bg-orange-600",
  //   DANGEROUS: "bg-red-600",
  //   CRITICAL: "bg-red-600",
  //   MODERATE: "bg-yellow-600",
  //   MIN: "bg-green-600",
  //   MAX: "bg-red-600",
  // }

  return (
    <div className='flex gap-4 mx-8'>
      <Card className="min-w-96">
        {
          readings.count > 0 ? (
            <>
              <CardHeader className="w-full px-16">
                <CardTitle className="text-2xl font-bold text-center">Top 3 de niveles altos</CardTitle>
                <p className="text-[#00b0c7] text-xs text-left">Las salas más contaminadas</p>
              </CardHeader>
              <CardContent className="w-full flex flex-col gap-8">
                {/* {
                  readings?.top.map(reading => (
                    <Card className="w-full shadow-lg" key={reading.date}>
                      <CardHeader className="relative pb-0">
                        <div className={`absolute left-12 -top-2 px-4 py-2 rounded-lg text-white text-sm font-medium ${colorByLever[reading.status] ?? 'bg-[#00b0c7]'} shadow-lg`}>

                          Nivel más alto {STATUS_TO_SPANISH[reading.status] ? `(${STATUS_TO_SPANISH[reading.status]})` : ''}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-8">
                        {
                          <ul className="space-y-4" >
                            <li className="flex items-center space-x-3">
                              <Wind className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                              <span className="text-sm">{INDICATOR_CONVERTED[reading.indicator]}: {reading.value} {UNIT_CONVERTED[reading.unit]}</span>
                            </li>
                            <li className="flex items-center space-x-3">
                              <Calendar className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                              <span className="text-sm">{formattedDate(reading.date)}</span>
                            </li>
                            <li className="flex items-center space-x-3">
                              <Clock className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                              <span className="text-sm">{reading.hour.toLowerCase()}</span>
                            </li>
                          </ul>
                        }
                      </CardContent>
                    </Card>
                  ))
                } */}
                {
                  TH.map((th, index) => {
                    return (
                      <RoomStatusCard data={th} key={index} />
                    )
                  })
                }
              </CardContent>
            </>
          ) : (
            <NoResultFound />
          )
        }
      </Card>
      <Card className="w-full flex-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-10">
          <IndicatorToggle indicators={indicators} indicatorParam={indicator} />
        </CardHeader>

        {/* {
          readings.count > 0 ? (
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {
                    readings.result?.map((indicator, i) =>
                    (
                      <TableRow key={i}>
                        <TableCell>{formattedDate(indicator.date)}</TableCell>
                        <TableCell>{indicator.hour.toLowerCase()}</TableCell>
                        <TableCell>{indicator.value}</TableCell>
                        <TableCell>{UNIT_CONVERTED[indicator.unit]}</TableCell>
                        <TableCell >{STATUS_TO_SPANISH[indicator.status]}</TableCell>
                      </TableRow>
                    )
                    )
                  }

                </TableBody>
              </Table>
            </CardContent>
          ) : (
            <NoResultFound />
          )
        }
        {readings.count > 0 && <PaginationNumberComponent count={readings.count} itemsPerPage={10} />} */}
        <div className="flex gap-2 mb-2">
          <MeasurementCard />
          <MeasurementCard />
          <MeasurementCard />
        </div>
        <div className="flex gap-2 mb-2">
          <MeasurementCard />
          <MeasurementCard />
          <MeasurementCard />
        </div>
        <div className="flex gap-2 mb-2">
          <MeasurementCard />
          <MeasurementCard />
          <MeasurementCard />
        </div>
        <div className="flex gap-2 mb-2">
          <MeasurementCard />
          <MeasurementCard />
          <MeasurementCard />
        </div>
        <div className="flex gap-2 mb-2">
          <MeasurementCard />
          <MeasurementCard />
          <MeasurementCard />
        </div>
        <div className="flex gap-2 mb-2">
          <MeasurementCard />
          <MeasurementCard />
          <MeasurementCard />
        </div>
        <div className="flex gap-2 mb-2">
          <MeasurementCard />
          <MeasurementCard />
          <MeasurementCard />
        </div>
      </Card>

    </div>
  )
}
