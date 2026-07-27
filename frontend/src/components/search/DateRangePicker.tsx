"use client";

import { DayPicker, type DateRange, type Matcher } from "react-day-picker";
import "react-day-picker/style.css";
import { addDays } from "date-fns";
import { parseDateOnly } from "@/lib/utils";
import type { UnavailableRange } from "@/types";

export default function DateRangePicker({
  selected,
  onSelect,
  unavailableRanges = [],
  numberOfMonths = 1,
}: {
  selected: DateRange | undefined;
  onSelect: (range: DateRange | undefined) => void;
  unavailableRanges?: UnavailableRange[];
  numberOfMonths?: number;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const disabledMatchers: Matcher[] = [
    { before: today },
    ...unavailableRanges.map((range) => ({
      from: parseDateOnly(range.check_in),
      // check_out is exclusive (half-open interval) -- the checkout day itself
      // is free for a new back-to-back booking, so only block up to the day before.
      to: addDays(parseDateOnly(range.check_out), -1),
    })),
  ];

  return (
    <div className="nomly-calendar">
      <DayPicker
        mode="range"
        selected={selected}
        onSelect={onSelect}
        disabled={disabledMatchers}
        numberOfMonths={numberOfMonths}
        startMonth={today}
      />
    </div>
  );
}
