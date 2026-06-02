import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { Box } from '@mui/material';

interface Props {
  month: Date;                    // any date inside the visible month
  availableDays: Set<string>;     // 'YYYY-MM-DD'
  selectedDay: Date | null;
  onMonthChange: (next: Date) => void;
  onDaySelect: (day: Date) => void;
}

function toKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function CalendarDay(
  props: PickersDayProps<Date> & { availableDays: Set<string> },
) {
  const { availableDays, day, ...rest } = props;
  const disabled = rest.outsideCurrentMonth || !availableDays.has(toKey(day));
  return (
    <PickersDay
      {...rest}
      day={day}
      disabled={disabled}
      data-testid={availableDays.has(toKey(day)) ? `calendar-day-${toKey(day)}` : undefined}
    />
  );
}

export function MonthCalendar({ month, availableDays, selectedDay, onMonthChange, onDaySelect }: Props) {
  return (
    <Box data-testid="month-calendar">
      <DateCalendar
        value={selectedDay}
        referenceDate={month}
        onChange={(d) => d && onDaySelect(d)}
        onMonthChange={(d) => onMonthChange(d)}
        slots={{ day: CalendarDay as any }}
        slotProps={{ day: { availableDays } as any }}
      />
    </Box>
  );
}
