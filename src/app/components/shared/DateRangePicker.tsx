import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "../../lib/utils";

export function DateRangePicker({
  onApply,
}: {
  onApply: (range: DateRange) => void;
}) {
  const [range, setRange] = useState<DateRange | undefined>(undefined);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[280px] h-[40px] justify-start text-left font-normal",
            !range?.from && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {range?.from && range.to ? (
            `${format(range.from, "PPP")} - ${format(range.to, "PPP")}`
          ) : (
            <span>Pick date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 space-y-2" align="start">
        <Calendar
          mode="range"
          selected={range}
          onSelect={setRange}
          numberOfMonths={2}
          initialFocus
        />
        <div className="flex justify-end">
          <Button
            onClick={() => {
              if (range?.from && range.to) {
                onApply(range);
              }
            }}
            disabled={!range?.from || !range?.to}
          >
            Okay
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
