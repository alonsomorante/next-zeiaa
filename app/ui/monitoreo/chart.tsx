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


const mockDataGraph = [
  {
    "id": 296,
    "Sala UPS": 145,
    "hours": "02:28 PM",
    "date": "2025-11-19",
    "Sala de Operaciones 1": 201,
    "Sala técnica": 93,
    "Sala de Operaciones 2": 110,
    "Sala de tomografía": 240,
    "Sala de Operaciones 3": 171,
    "Sala de Operaciones 4": 82,
    "Subestación eléctrica": 150
  },
  {
    "id": 297,
    "Sala UPS": 138,
    "hours": "02:58 PM",
    "date": "2025-11-19",
    "Sala de Operaciones 1": 195,
    "Sala técnica": 98,
    "Sala de Operaciones 2": 115,
    "Sala de tomografía": 235,
    "Sala de Operaciones 3": 165,
    "Sala de Operaciones 4": 88,
    "Subestación eléctrica": 155
  },
  {
    "id": 298,
    "Sala UPS": 152,
    "hours": "03:28 PM",
    "date": "2025-11-19",
    "Sala de Operaciones 1": 205,
    "Sala técnica": 89,
    "Sala de Operaciones 2": 105,
    "Sala de tomografía": 245,
    "Sala de Operaciones 3": 175,
    "Sala de Operaciones 4": 78,
    "Subestación eléctrica": 145
  },
  {
    "id": 299,
    "Sala UPS": 149,
    "hours": "03:58 PM",
    "date": "2025-11-19",
    "Sala de Operaciones 1": 203,
    "Sala técnica": 91,
    "Sala de Operaciones 2": 112,
    "Sala de tomografía": 242,
    "Sala de Operaciones 3": 173,
    "Sala de Operaciones 4": 85,
    "Subestación eléctrica": 153
  },
  {
    "id": 300,
    "Sala UPS": 140,
    "hours": "04:28 PM",
    "date": "2025-11-19",
    "Sala de Operaciones 1": 198,
    "Sala técnica": 95,
    "Sala de Operaciones 2": 108,
    "Sala de tomografía": 238,
    "Sala de Operaciones 3": 168,
    "Sala de Operaciones 4": 90,
    "Subestación eléctrica": 148
  },
  {
    "id": 301,
    "Sala UPS": 147,
    "hours": "04:58 PM",
    "date": "2025-11-19",
    "Sala de Operaciones 1": 204,
    "Sala técnica": 92,
    "Sala de Operaciones 2": 114,
    "Sala de tomografía": 244,
    "Sala de Operaciones 3": 174,
    "Sala de Operaciones 4": 80,
    "Subestación eléctrica": 151
  },
  {
    "id": 302,
    "Sala UPS": 142,
    "hours": "05:28 PM",
    "date": "2025-11-19",
    "Sala de Operaciones 1": 200,
    "Sala técnica": 96,
    "Sala de Operaciones 2": 107,
    "Sala de tomografía": 236,
    "Sala de Operaciones 3": 167,
    "Sala de Operaciones 4": 87,
    "Subestación eléctrica": 154
  }
]

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
              data={mockDataGraph}
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
                domain={[0, domaninY * 1.4]}
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
