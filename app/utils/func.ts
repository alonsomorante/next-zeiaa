import { addDays, format, parse } from "date-fns"
import { es } from 'date-fns/locale'
import { create } from "zustand"

interface RoomState {
  roomId: string
  changeRoom: (roomId: string) => void
}

export const useRoom = create<RoomState>((set) => ({
  roomId: '',
  changeRoom: (roomId: string) => set({ roomId }),
}))

export interface RoomFilter {
  id: string;
  name: string;
}

export interface RoomFilterState {
  selectedRooms: RoomFilter[];
  setSelectedRooms: (rooms: RoomFilter[]) => void;
  addRoom: (room: RoomFilter) => void;
  removeRoom: (roomId: string) => void;
  clearRooms: () => void;
  isRoomSelected: (roomId: string) => boolean;
  getSelectedRoomIds: () => string[];
}

export const useRoomFilter = create<RoomFilterState>((set, get) => ({
  selectedRooms: [],

  setSelectedRooms: (rooms) => set({ selectedRooms: rooms }),

  addRoom: (room) => set((state) => ({
    selectedRooms: [...state.selectedRooms, room]
  })),

  removeRoom: (roomId) => set((state) => ({
    selectedRooms: state.selectedRooms.filter(room => room.id !== roomId)
  })),

  clearRooms: () => set({ selectedRooms: [] }),

  isRoomSelected: (roomId) => {
    return get().selectedRooms.some(room => room.id === roomId);
  },

  getSelectedRoomIds: () => {
    return get().selectedRooms.map(room => room.id);
  },
}));

export const capitalizeFirstLetter = (str: string) => {
  if (!str) return str; // Verifica si la cadena está vacía
  return str.charAt(0).toUpperCase() + str.slice(1)
};

export const formattedDate = (date: string) => {
  // Parsear la cadena de fecha en un objeto Date
  const parsedDate = parse(date, 'yyyy-MM-dd', new Date())

  // Verificar si la fecha es válida
  // if (isNaN(parsedDate.getTime())) {
  //   throw new Error("Invalid date format");
  // }



  // Sumar un día a la fecha analizada
  // const nextDay = addDays(parsedDate, 1)

  // Formatear la fecha
  return capitalizeFirstLetter(format(parsedDate, "EEEE d 'de' MMMM", { locale: es }));
}

export const formattedDateWithHour = (date: string) => {
  console.log(date)
  // Parsear la cadena de fecha en un objeto Date
  const parsedDate = new Date(date);

  // Verificar si la fecha es válida
  // if (isNaN(parsedDate.getTime())) {
  //   throw new Error("Invalid date format");
  // }

  // Sumar un día a la fecha analizada
  // const nextDay = addDays(parsedDate, 1);

  // Formatear la fecha
  return capitalizeFirstLetter(format(parsedDate, "HH:mm", { locale: es }));
};


export const formattedWithoutMonth = (date: string) => {
  // Parsear la cadena de fecha en un objeto Date
  const parsedDate = new Date(date);

  // Verificar si la fecha es válida
  // if (isNaN(parsedDate.getTime())) {
  //   throw new Error("Invalid date format");
  // }

  // Sumar un día a la fecha analizada
  // const nextDay = addDays(parsedDate, 1);

  // Formatear la fecha
  return capitalizeFirstLetter(format(parsedDate, "EEEE d", { locale: es }));
};

export const formattedDatePlusDay = (date: string) => {
  // Parsear la cadena de fecha en un objeto Date
  const parsedDate = new Date(date);

  // Verificar si la fecha es válida
  // if (isNaN(parsedDate.getTime())) {
  //   throw new Error("Invalid date format");
  // }

  // Sumar un día a la fecha analizada
  const nextDay = addDays(parsedDate, 1)

  return nextDay
}


export function formattedSecond(second: number) {
  // Redondear los segundos a un número entero
  const segundosRedondeados = Math.round(second);

  // Calcular días, horas, minutos y segundos restantes
  const dias = Math.floor(segundosRedondeados / 86400);
  let segundosRestantes = segundosRedondeados % 86400;

  const horas = Math.floor(segundosRestantes / 3600);
  segundosRestantes %= 3600;

  const minutos = Math.floor(segundosRestantes / 60);
  const segundosFinales = segundosRestantes % 60;

  // Construir el resultado
  const partes = [];
  if (dias > 0) {
    partes.push(`${dias}d`);
  }
  if (horas > 0) {
    partes.push(`${horas}h`);
  }
  if (minutos > 0) {
    partes.push(`${minutos}m`);
  }
  if (segundosFinales > 0) {
    partes.push(`${segundosFinales}s`);
  }

  // Devolver el resultado o "0s" si no hay partes
  return partes.length > 0 ? partes.join('') : '0s';
}

export function formatFromUS(date: string) {
  return format(date, 'dd-MM-yyyy')
}