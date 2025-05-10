"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateTimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export function DateTimePicker({ date, setDate }: DateTimePickerProps) {
  const [selectedTime, setSelectedTime] = React.useState<{
    hours: string;
    minutes: string;
  }>({
    hours: date ? format(date, "HH") : "12",
    minutes: date ? format(date, "mm") : "00",
  });

  // Generate hours and minutes options
  const hours = Array.from({ length: 24 }, (_, i) => 
    i.toString().padStart(2, "0")
  );
  
  const minutes = Array.from({ length: 60 }, (_, i) => 
    i.toString().padStart(2, "0")
  );

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const hours = parseInt(selectedTime.hours, 10);
      const minutes = parseInt(selectedTime.minutes, 10);
      
      selectedDate.setHours(hours);
      selectedDate.setMinutes(minutes);
      
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (type: "hours" | "minutes", value: string) => {
    setSelectedTime((prev) => ({ ...prev, [type]: value }));

    if (date) {
      const newDate = new Date(date);
      
      if (type === "hours") {
        newDate.setHours(parseInt(value, 10));
      } else {
        newDate.setMinutes(parseInt(value, 10));
      }
      
      setDate(newDate);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP, HH:mm") : <span>Sélectionner une date et heure</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          fromYear={2024}
          toYear={2030}
        />
        <div className="border-t p-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <Select
              value={selectedTime.hours}
              onValueChange={(value) => handleTimeChange("hours", value)}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder="Heure" />
              </SelectTrigger>
              <SelectContent position="popper" className="h-[200px]">
                {hours.map((hour) => (
                  <SelectItem key={hour} value={hour}>
                    {hour}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-muted-foreground">:</span>
            <Select
              value={selectedTime.minutes}
              onValueChange={(value) => handleTimeChange("minutes", value)}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder="Min" />
              </SelectTrigger>
              <SelectContent position="popper" className="h-[200px]">
                {minutes.map((minute) => (
                  <SelectItem key={minute} value={minute}>
                    {minute}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}