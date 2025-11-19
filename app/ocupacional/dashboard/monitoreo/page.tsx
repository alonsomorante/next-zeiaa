import { roomsList } from "@/app/sevices/enterprise/data"
import { getRooms } from "@/app/sevices/filters/data"
import { readingsData, roomGeneralData, roomLastData } from "@/app/sevices/readings/data"
import { Indicator, SearchParams, Unit } from "@/app/type"
import FiltersContainer from "@/app/ui/filters/filters-container"
// import RoomSelect from "@/app/ui/filters/room-select"
import ToggleSelectGroup from "@/app/ui/filters/room-select-group"
import ChartComponent from "@/app/ui/monitoreo/chart"
import TableComponent from "@/app/ui/monitoreo/table"
// import { X } from "lucide-react"

type Result = {
  indicator: string,
  value: string,
  unit: string,
  status: string,
  hours: string,
  date: string
}

interface Room {
  id: number
  name: string
  status: string
  is_activated: boolean,
  devices: { dev_eui: string, id: number, type_sensor: string }[],
  headquarter: { id: number, name: string }
}

type NewRoom = {

  id: number,
  name: string
}

export default async function Page({ searchParams }: SearchParams) {

  const { room, indicator = 'CO2', unit = 'PPM' } = await searchParams

  const rooms = await getRooms()
  const firstRoom = rooms.find((room: any) => room.is_activated === true)  // eslint-disable-line @typescript-eslint/no-explicit-any

  const currentFirstRoom = room ? room : firstRoom.id
  const data = await roomLastData({ roomId: currentFirstRoom })
  const roomsListReadings = await roomsList({ limit: '50' })
  const roomsId = roomsListReadings.results.map((room: Room) => room.is_activated ? { id: room.id, name: room.name } : null).filter((id: number | null) => id !== null)
  const { results } = await readingsData({ roomId: currentFirstRoom, indicator, unit })

  const sortResults = (results: Result[]): Result[] => {
    return results.sort((a, b) => {

      const [aHours] = a.hours ? a.hours.split(' ') : ['00:00']
      const [bHours] = b.hours ? b.hours.split(' ') : ['00:00']

      const timeA = new Date(`1970-01-01T${aHours}`)
      const timeB = new Date(`1970-01-01T${bHours}`)

      return timeA.getTime() - timeB.getTime()
    });
  }

  // const fetchAllRoomsData = async (roomIds: NewRoom[]) => {
  //   try {
  //     const promises = roomIds.map(roomId => {
  //       return readingsData({ roomId: roomId.id, indicator, unit })
  //     });

  //     const results = (await Promise.all(promises)).map((res, index) => {
  //       const aaa = res.results.map(r => {
  //         return {
  //           id: roomIds[index].id,
  //           name: roomIds[index].name,
  //         }
  //       })

  //       const sort = sortResults(aaa)

  //       return sort
  //     })
  //     return results;
  //   } catch (error) {
  //     console.error('Error fetching rooms data:', error);
  //     throw error;
  //   }
  // }

  const fetchAllLastData = async (roomIds: NewRoom[]) => {
    try {
      const promises = roomIds.map(roomId => {
        return roomLastData({ roomId: roomId.id })
      })
      const results = (await Promise.all(promises)).map((res, index) => {
        return {
          id: roomIds[index].id,
          name: roomIds[index].name,
          indicators: [...res],
          date: res.date,
          hours: res.hours
        }
      })

      return results

    } catch (error) {
      console.error('Error fetching rooms data:', error)
    }
  }

  // const roomsData = await fetchAllRoomsData(roomsId)
  const lastData = await fetchAllLastData(roomsId)

  console.log({
    data,

  })

  const { name } = rooms.find((room: Room) => room.id === Number(currentFirstRoom))
  const { status } = roomsListReadings.results.find((room: Room) => room.id === Number(currentFirstRoom))



  const generalRoomData = await roomGeneralData({ roomId: currentFirstRoom })

  const devUI = generalRoomData?.devices[0]?.dev_eui

  // Se deben mostrar las lineas de todas las salas según el indicador que este seleccionadao. Todas las lineas temperatura por ejemplo para todas las salas que esteb seleccionadas


  return (
    <div>
      <FiltersContainer>
        {/* <RoomSelect firstRoom={currentFirstRoom} rooms={rooms} /> */}
        <ToggleSelectGroup roomsId={roomsId} />
      </FiltersContainer>
      <div className="flex gap-4 mx-2">
        <TableComponent data={lastData} name={name} devUI={devUI} room={currentFirstRoom} status={status} />
        <ChartComponent results={sortResults(results)} generalRoomData={generalRoomData} indicator={indicator as Indicator} unit={unit as Unit} thresholds={generalRoomData.thresholds} />
      </div>
    </div>
  )
}
