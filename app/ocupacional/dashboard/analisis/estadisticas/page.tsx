import { roomsList } from "@/app/sevices/enterprise/data";
import { getRooms } from "@/app/sevices/filters/data";
import { readingsGraph, roomGeneralData } from "@/app/sevices/readings/data";
import { Indicator, SearchParams, Unit } from "@/app/type";
import { ChartComponent } from "@/app/ui/analisis/estadisticas/chart";
import { DatepickerRange } from "@/app/ui/filters/datepicker-range";
import FiltersContainer from "@/app/ui/filters/filters-container";
// import RoomSelect from "@/app/ui/filters/room-select";
import ToggleSelectGroup from "@/app/ui/filters/room-select-group";
import { format } from "date-fns";

export default async function page({ searchParams }: SearchParams) {
  // const { first_room: firstRoom } = await detail()

  const { room, indicator = 'CO2', unit = 'PPM', date_after = new Date(), date_before = new Date(), start = '00:00', end = '23:00' } = await searchParams

  const formattedDateAfter = format(date_after, 'yyyy-MM-dd')
  const formattedDateBefore = format(date_before, 'yyyy-MM-dd')

  const rooms = await getRooms()
  const firstRoom = rooms.find((room: any) => room.is_activated === true)  // eslint-disable-line @typescript-eslint/no-explicit-any

  const currentFirstRoom = room ? room : firstRoom.id

  const readings = await readingsGraph({ roomId: currentFirstRoom, indicator, unit, date_after: formattedDateAfter, date_before: formattedDateBefore, hour_after: start, hour_before: end })
  const generalRoomData = await roomGeneralData({ roomId: currentFirstRoom })

  const roomsListReadings = await roomsList({ limit: '50' })
  const roomsId = roomsListReadings.results.map((room: any) => room.is_activated ? { id: room.id, name: room.name } : null).filter((id: number | null) => id !== null) // eslint-disable-line @typescript-eslint/no-explicit-any



  return (
    <div>
      <FiltersContainer>
        {/* <RoomSelect firstRoom={currentFirstRoom} rooms={rooms} /> */}
        <ToggleSelectGroup roomsId={roomsId} />
        <DatepickerRange />
      </FiltersContainer>
      <div>

        <ChartComponent readings={readings} indicator={indicator as Indicator} unit={unit as Unit} generalRoomData={generalRoomData} start={start} end={end} />
      </div>
    </div>
  )
}
