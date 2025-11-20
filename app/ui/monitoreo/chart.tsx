'use client'
import IndicatorToggle from "../filters/indicators-toggle";
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts"
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { STATUS_COLOR, STATUS_COLOR_THRESHOLD, STATUS_TO_SPANISH, UNIT_CONVERTED } from "@/app/utils/formatter";
// import { UNIT_INDICATOR_THRESHOLD, UNIT_INDICATOR_THRESHOLD_AMBIENTAL } from "@/app/utils/threshold";
import { Indicator, Unit } from "@/app/type";
// import { usePathname } from "next/navigation";
import NoResultFound from "../no-result-found";

interface IndicatorStructure {
  indicator: string,
  value: string,
  unit: string,
  status: string,
  hours: string,
  date: string
}

interface IndicatorToogle {
  indicator: string,
  unit: string
}

interface RoomDataStructure {
  id: number,
  name: string,
  status: string,
  headquarter: {
    id: number,
    name: string
  }
  indicators_activated: IndicatorToogle[],
  indicators_pollutants: IndicatorToogle[],
  is_activated: boolean,
  thresholds: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface ChartComponentProps {
  results: IndicatorStructure[]
  generalRoomData: RoomDataStructure
  indicator: Indicator,
  unit: Unit,
  thresholds: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

const chartConfig = {
  desktop: {
    color: "#00b0c7",
  },

} satisfies ChartConfig


const mockData = {
  // Datos de Dióxido de Carbono (500 a 2800 ppm)
  CO2: [
    {
      "hours": "02:28 PM",
      "date": "2025-11-19",
      "Sala UPS": 750, // Bajo
      "Sala de Operaciones 1": 1500, // Medio
      "Sala técnica": 2200, // Muy Alto
      "Sala de Operaciones 2": 1300,
      "Sala de tomografía": 900,
      "Sala de Operaciones 3": 1700,
      "Sala de Operaciones 4": 2500, // Máximo
      "Subestación eléctrica": 600 // Mínimo
    },
    {
      "hours": "02:58 PM",
      "date": "2025-11-19",
      "Sala UPS": 800,
      "Sala de Operaciones 1": 1700,
      "Sala técnica": 1900, // Baja
      "Sala de Operaciones 2": 1100, // Baja
      "Sala de tomografía": 1250, // Sube
      "Sala de Operaciones 3": 2000,
      "Sala de Operaciones 4": 2100, // Baja
      "Subestación eléctrica": 720
    },
    {
      "hours": "03:28 PM",
      "date": "2025-11-19",
      "Sala UPS": 950,
      "Sala de Operaciones 1": 1950,
      "Sala técnica": 2500, // Sube mucho
      "Sala de Operaciones 2": 900, // Baja mucho
      "Sala de tomografía": 1500,
      "Sala de Operaciones 3": 1850, // Baja
      "Sala de Operaciones 4": 1800, // Baja
      "Subestación eléctrica": 550 // Baja
    },
    {
      "hours": "03:58 PM",
      "date": "2025-11-19",
      "Sala UPS": 1100,
      "Sala de Operaciones 1": 1600, // Baja
      "Sala técnica": 2800, // Pico
      "Sala de Operaciones 2": 1050,
      "Sala de tomografía": 1900, // Sube mucho
      "Sala de Operaciones 3": 1550, // Baja
      "Sala de Operaciones 4": 2050, // Sube
      "Subestación eléctrica": 650
    },
    {
      "hours": "04:28 PM",
      "date": "2025-11-19",
      "Sala UPS": 1300,
      "Sala de Operaciones 1": 1250, // Baja
      "Sala técnica": 2600, // Baja
      "Sala de Operaciones 2": 1400, // Sube
      "Sala de tomografía": 1450, // Baja
      "Sala de Operaciones 3": 1800, // Sube
      "Sala de Operaciones 4": 2300,
      "Subestación eléctrica": 780
    },
    {
      "hours": "04:58 PM",
      "date": "2025-11-19",
      "Sala UPS": 1550,
      "Sala de Operaciones 1": 1000, // Baja
      "Sala técnica": 2100, // Baja
      "Sala de Operaciones 2": 1650,
      "Sala de tomografía": 1000, // Baja mucho
      "Sala de Operaciones 3": 1950,
      "Sala de Operaciones 4": 2800, // Pico
      "Subestación eléctrica": 850
    },
    {
      "hours": "05:28 PM",
      "date": "2025-11-19",
      "Sala UPS": 1800, // Sube
      "Sala de Operaciones 1": 850, // Baja
      "Sala técnica": 1800,
      "Sala de Operaciones 2": 1900,
      "Sala de tomografía": 700, // Mínimo
      "Sala de Operaciones 3": 2100,
      "Sala de Operaciones 4": 2400, // Baja
      "Subestación eléctrica": 920 // Sube
    }
  ],

  // Datos de Temperatura (10 a 40 °C)
  TEMPERATURE: [
    {
      "hours": "02:28 PM",
      "date": "2025-11-19",
      "Sala UPS": 32.5, // Alto
      "Sala de Operaciones 1": 19.0, // Bajo
      "Sala técnica": 38.0, // Muy Alto
      "Sala de Operaciones 2": 21.5,
      "Sala de tomografía": 25.0,
      "Sala de Operaciones 3": 20.0,
      "Sala de Operaciones 4": 29.0,
      "Subestación eléctrica": 35.5 // Alto
    },
    {
      "hours": "02:58 PM",
      "date": "2025-11-19",
      "Sala UPS": 30.0, // Baja
      "Sala de Operaciones 1": 22.0, // Sube
      "Sala técnica": 39.5, // Sube
      "Sala de Operaciones 2": 20.5, // Baja
      "Sala de tomografía": 28.0, // Sube
      "Sala de Operaciones 3": 21.0,
      "Sala de Operaciones 4": 27.5, // Baja
      "Subestación eléctrica": 36.0
    },
    {
      "hours": "03:28 PM",
      "date": "2025-11-19",
      "Sala UPS": 28.5,
      "Sala de Operaciones 1": 24.5,
      "Sala técnica": 37.0, // Baja
      "Sala de Operaciones 2": 18.0, // Baja
      "Sala de tomografía": 31.0, // Sube
      "Sala de Operaciones 3": 23.5, // Sube
      "Sala de Operaciones 4": 25.0, // Baja
      "Subestación eléctrica": 34.0 // Baja
    },
    {
      "hours": "03:58 PM",
      "date": "2025-11-19",
      "Sala UPS": 31.0, // Sube
      "Sala de Operaciones 1": 26.0,
      "Sala técnica": 39.9, // Pico
      "Sala de Operaciones 2": 19.5,
      "Sala de tomografía": 29.0, // Baja
      "Sala de Operaciones 3": 25.0,
      "Sala de Operaciones 4": 26.5,
      "Subestación eléctrica": 35.0
    },
    {
      "hours": "04:28 PM",
      "date": "2025-11-19",
      "Sala UPS": 33.0,
      "Sala de Operaciones 1": 23.0, // Baja
      "Sala técnica": 35.5, // Baja
      "Sala de Operaciones 2": 22.5, // Sube
      "Sala de tomografía": 26.5, // Baja
      "Sala de Operaciones 3": 26.0,
      "Sala de Operaciones 4": 24.0, // Baja
      "Subestación eléctrica": 33.5
    },
    {
      "hours": "04:58 PM",
      "date": "2025-11-19",
      "Sala UPS": 30.5, // Baja
      "Sala de Operaciones 1": 20.0, // Baja
      "Sala técnica": 33.0,
      "Sala de Operaciones 2": 25.0,
      "Sala de tomografía": 24.0,
      "Sala de Operaciones 3": 27.5,
      "Sala de Operaciones 4": 22.0, // Baja
      "Subestación eléctrica": 32.0
    },
    {
      "hours": "05:28 PM",
      "date": "2025-11-19",
      "Sala UPS": 28.0,
      "Sala de Operaciones 1": 17.0, // Mínimo
      "Sala técnica": 30.0,
      "Sala de Operaciones 2": 27.0, // Sube
      "Sala de tomografía": 21.0,
      "Sala de Operaciones 3": 29.0, // Sube
      "Sala de Operaciones 4": 20.0,
      "Subestación eléctrica": 30.5
    }
  ],

  // Datos de Humedad (20 a 80 %)
  HUMIDITY: [
    {
      "hours": "02:28 PM",
      "date": "2025-11-19",
      "Sala UPS": 75, // Alto
      "Sala de Operaciones 1": 40, // Bajo
      "Sala técnica": 25, // Mínimo
      "Sala de Operaciones 2": 50,
      "Sala de tomografía": 65,
      "Sala de Operaciones 3": 45,
      "Sala de Operaciones 4": 30,
      "Subestación eléctrica": 70
    },
    {
      "hours": "02:58 PM",
      "date": "2025-11-19",
      "Sala UPS": 78, // Sube
      "Sala de Operaciones 1": 35, // Baja
      "Sala técnica": 28, // Sube
      "Sala de Operaciones 2": 55, // Sube
      "Sala de tomografía": 60, // Baja
      "Sala de Operaciones 3": 50,
      "Sala de Operaciones 4": 35,
      "Subestación eléctrica": 73
    },
    {
      "hours": "03:28 PM",
      "date": "2025-11-19",
      "Sala UPS": 70, // Baja
      "Sala de Operaciones 1": 30, // Mínimo
      "Sala técnica": 35, // Sube
      "Sala de Operaciones 2": 60,
      "Sala de tomografía": 55,
      "Sala de Operaciones 3": 55,
      "Sala de Operaciones 4": 40,
      "Subestación eléctrica": 68 // Baja
    },
    {
      "hours": "03:58 PM",
      "date": "2025-11-19",
      "Sala UPS": 65,
      "Sala de Operaciones 1": 45, // Sube
      "Sala técnica": 42, // Sube
      "Sala de Operaciones 2": 65,
      "Sala de tomografía": 50,
      "Sala de Operaciones 3": 60, // Sube
      "Sala de Operaciones 4": 48, // Sube
      "Subestación eléctrica": 62
    },
    {
      "hours": "04:28 PM",
      "date": "2025-11-19",
      "Sala UPS": 60,
      "Sala de Operaciones 1": 55,
      "Sala técnica": 50,
      "Sala de Operaciones 2": 70, // Sube
      "Sala de tomografía": 45, // Baja
      "Sala de Operaciones 3": 65,
      "Sala de Operaciones 4": 55,
      "Subestación eléctrica": 55 // Baja
    },
    {
      "hours": "04:58 PM",
      "date": "2025-11-19",
      "Sala UPS": 55,
      "Sala de Operaciones 1": 65,
      "Sala técnica": 58,
      "Sala de Operaciones 2": 78, // Casi pico
      "Sala de tomografía": 40, // Baja
      "Sala de Operaciones 3": 70,
      "Sala de Operaciones 4": 65,
      "Subestación eléctrica": 50
    },
    {
      "hours": "05:28 PM",
      "date": "2025-11-19",
      "Sala UPS": 50,
      "Sala de Operaciones 1": 75, // Pico
      "Sala técnica": 65,
      "Sala de Operaciones 2": 80, // Máximo
      "Sala de tomografía": 35, // Bajo
      "Sala de Operaciones 3": 78,
      "Sala de Operaciones 4": 75, // Sube
      "Subestación eléctrica": 45 // Baja
    }
  ]
};

const salaKeys = [
  "Sala UPS",
  "Sala de Operaciones 1",
  "Sala técnica",
  "Sala de Operaciones 2",
  "Sala de tomografía",
  "Sala de Operaciones 3",
  "Sala de Operaciones 4",
  "Subestación eléctrica"
];

// 2. Definición opcional de colores para cada línea
const colors = [
  "#8884d8", // Púrpura
  "#82ca9d", // Verde
  "#ffc658", // Amarillo
  "#d0ed57", // Lima
  "#a4de6c", // Verde claro
  "#d0ed57", // Lima (repetición)
  "#83a6ed", // Azul claro
  "#ff7300"  // Naranja
];


export default function ChartComponent({ results, generalRoomData, indicator, unit }: ChartComponentProps) {

  const { indicators_pollutants: indicators, thresholds } = generalRoomData

  const [{ value: domaninY }] = thresholds[indicator].levels.slice(-1)

  const th = thresholds[indicator].levels

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex justify-between items-center gap-2">
          <CardTitle className="text-balance text-lg">Estadísticas en tiempo real</CardTitle>
          <IndicatorToggle indicators={indicators} indicatorParam={indicator} />
        </div>
        <br />
        {
          results.length !== 0 && (
            <div className="w-full">
              <div className="text-xs font-medium mb-2">Umbrales:</div>
              <div className="flex flex-wrap gap-4">
                {th?.map((threshold: any, i: any) => {  // eslint-disable-line @typescript-eslint/no-explicit-any
                  return (
                    <div key={i}>
                      <div>
                        <p className={`${STATUS_COLOR[threshold.level as keyof typeof STATUS_COLOR]}`}>-- {STATUS_TO_SPANISH[threshold.level as keyof typeof STATUS_TO_SPANISH]}</p>
                        <p>{threshold.value} {UNIT_CONVERTED[unit]}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        }

      </CardHeader>
      {
        results.length === 0 ? (
          <NoResultFound />
        ) : (
          <ChartContainer config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={mockData[indicator as keyof typeof mockData]}
              margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="hours"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                hide={false}
                tickMargin={8}
                dataKey="value"
                domain={[0, domaninY * 2]}
                tickFormatter={(a) => `${a} ${UNIT_CONVERTED[unit]}`}
                style={{ paddingTop: '40px' }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
              />
              {

                th?.map((threshold: any, i: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                  <ReferenceLine
                    key={`${threshold.level}-${i}`}
                    y={threshold.value}
                    stroke={STATUS_COLOR_THRESHOLD[threshold.level as keyof typeof STATUS_COLOR_THRESHOLD]}
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    isFront={true}
                  />
                ))
              }
              {salaKeys.map((key, index) => (
                <Line
                  key={key} // Es crucial usar el 'key' único
                  dataKey={key} // La clave de los datos para la línea
                  type="natural"
                  stroke={colors[index % colors.length]} // Asignamos un color
                  strokeWidth={2}
                  dot={false}
                />
              ))}


            </LineChart>
          </ChartContainer>
        )
      }


    </Card>
  )
}
