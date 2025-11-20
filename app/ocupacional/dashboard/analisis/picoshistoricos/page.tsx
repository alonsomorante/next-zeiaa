import { readingsPeaks, roomGeneralData } from "@/app/sevices/readings/data";
import TableComponent from "@/app/ui/picos/table";
import { DatepickerRange } from "@/app/ui/filters/datepicker-range";
import FiltersContainer from "@/app/ui/filters/filters-container";
import { format } from "date-fns";
import { getRooms } from "@/app/sevices/filters/data";
// import RoomSelect from "@/app/ui/filters/room-select";
import { Indicator } from "@/app/type";
import StatusSelect from "@/app/ui/filters/status-select";
import { roomsList } from "@/app/sevices/enterprise/data";
import ToggleSelectGroup from "@/app/ui/filters/room-select-group";

type SearchParams = {
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export default async function page({ searchParams }: SearchParams) {


  const { room, indicator = 'CO2', unit = 'PPM', date_after = new Date(), date_before = new Date(), page, status } = await searchParams

  const formattedDateAfter = format(date_after, 'yyyy-MM-dd')
  const formattedDateBefore = format(date_before, 'yyyy-MM-dd')

  const rooms = await getRooms()
  const firstRoom = rooms.find((room: any) => room.is_activated === true)  // eslint-disable-line @typescript-eslint/no-explicit-any

  const currentFirstRoom = room ? room : firstRoom.id
  const generalRoomData = await roomGeneralData({ roomId: currentFirstRoom })
  const readings = await readingsPeaks({ roomId: currentFirstRoom, indicator, unit, date_after: formattedDateAfter, date_before: formattedDateBefore, page, status })

  const thresholdsFilters = generalRoomData?.thresholds_filter[indicator]

  const roomsListReadings = await roomsList({ limit: '50' })
  const roomsId = roomsListReadings.results.map((room: any) => room.is_activated ? { id: room.id, name: room.name } : null).filter((id: number | null) => id !== null) // eslint-disable-line @typescript-eslint/no-explicit-any

  // console.log(roomsId)
  console.log(generalRoomData.thresholds)





  return (
    <div>
      <FiltersContainer>
        {/* <RoomSelect firstRoom={currentFirstRoom} rooms={rooms} /> */}
        <ToggleSelectGroup roomsId={roomsId} />
        <StatusSelect status_filter={thresholdsFilters} />
        <DatepickerRange />
      </FiltersContainer>
      <TableComponent generalRoomData={generalRoomData} readings={readings} indicator={indicator as Indicator} />
    </div>
  )
}
