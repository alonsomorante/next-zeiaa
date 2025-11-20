'use client'
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown } from 'lucide-react';

type Room = {
  id: number,
  name: string
}

export default function ToggleSelectGroup({ roomsId }: { roomsId?: Room[] }) {
  const [open, setOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>([])

  const toggleItem = (value: string) => {
    setSelectedValues(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            className="w-full justify-between bg-[#00b0c7] text-white font-medium"
          >
            <span>Seleccionar Salas {selectedValues.length > 0 && `(${selectedValues.length})`}</span>
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[260px] p-0" align="start">
          <div className="max-h-[280px] overflow-y-auto">
            {roomsId?.map((room) => (
              <div
                key={room.id}
                onClick={() => toggleItem(room.id.toString())}
                className="relative flex cursor-pointer items-center px-3 py-2.5 text-sm hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div
                  className={`mr-3 flex h-4 w-4 items-center justify-center rounded border ${selectedValues.includes(room.id.toString())
                    ? 'bg-[#00b0c7]'
                    : 'border-gray-300 bg-white'
                    }`}
                >
                  {selectedValues.includes(room.id.toString()) && (
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  )}
                </div>
                <span className="text-gray-700">{room.name}</span>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}