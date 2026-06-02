"use client"

import { useState } from "react"
import { capitalizeFirstLetter } from "@/app/utils/func"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { HelpCircle } from "lucide-react"

interface Thread {
  id: number
  name: string
  type: string
}

interface Panel {
  id?: number
  name?: string
  is_active?: boolean
  type: string
  threads?: Thread[] | null
}

interface Powers {
  id: number
  power_installed: number
  power_contracted: number
  power_max: number
}

export default function ContractedPowerSidebar({ panel, powers, power_installed, power_max, power_contracted }: { panel: Panel; powers: Powers[], power_installed: number | null, power_max: number | null, power_contracted: number | null }) {

  const [isModalOpen, setIsModalOpen] = useState(false)


  return (
    <div className="p-4">
      <div className="p-4 space-y-5">
        <div className="flex gap-2">
          <div className="flex-1 bg-gray-100 flex flex-col items-center gap-2 p-2 rounded-lg">
            <p className="text-nowrap text-xs">Potencia contratada</p>
            <p className="font-semibold font-sm">{power_contracted ? power_contracted + ' kW' : 'No estimada'}</p>
          </div>
          <div className="flex-1 bg-gray-100 flex flex-col items-center gap-2 p-2 rounded-lg">
            <p className="text-nowrap text-xs">Tipo</p>
            <p className="font-semibold font-sm">{capitalizeFirstLetter(panel?.type)}</p>
          </div>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="text-sm">Máxima demanda de potencia:</span>
            <span className="text-sm font-medium ml-auto text-nowrap">{power_max ? power_max + ' kW' : 'No estimada'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            <span className="text-sm">Potencia contratada:</span>
            <span className="text-sm font-medium ml-auto text-nowrap">{power_contracted ? power_contracted + ' kW' : 'No estimada'}</span>
          </div>
          {/* <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
            <span className="text-sm">Potencia instalada</span>
            <span className="text-sm font-medium ml-auto text-nowrap">{powers?.[0].power_installed} kW</span>
          </div> */}
        </div>

        <Button variant="secondary" className="w-full gap-2 text-sm h-8" onClick={() => setIsModalOpen(true)}>
          <HelpCircle className="w-3.5 h-3.5" />
          ¿Qué se mide?
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Qué se mide?</DialogTitle>
            {/* <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Cerrar</span>
            </DialogClose> */}
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-sm flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                Máxima demanda de potencia
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Es el valor máximo de potencia que se ha demandado en un período determinado.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-sm flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                Potencia contratada
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Es la potencia que se ha acordado con la compañía eléctrica y por la que se paga en la factura.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-sm flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                Potencia instalada
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                La potencia instalada es la sumatoría de las potencias activas nominales de todos los artefactos y
                equipos que se alimentan de un suministro de electricidad.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

