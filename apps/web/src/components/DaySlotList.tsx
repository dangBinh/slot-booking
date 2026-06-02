import { Box, Button, Stack, Typography, Alert } from '@mui/material';
import type { Slot } from '../lib/groupSlotsByDay';

interface Props {
  day: Date | null;
  slots: Slot[];
  onPick: (slot: Slot) => void;
}

const FMT = new Intl.DateTimeFormat('en-US', {
  weekday: 'short', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
});

function timeOf(iso: string): string { return iso.slice(11, 16); }

export function DaySlotList({ day, slots, onPick }: Props) {
  if (!day) return <Alert severity="info">Pick a day to see slots.</Alert>;
  if (slots.length === 0) return <Alert severity="info">No slots for this day.</Alert>;

  return (
    <Box data-testid="day-slot-list">
      <Typography variant="subtitle1" gutterBottom>
        Slots for {FMT.format(day)} (UTC)
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={1}>
        {slots.map(s => {
          const time = timeOf(s.start);
          const testProps = {
            'data-testid': `slot-${s.start}`,
            'data-status': s.status,
          } as Record<string, string>;
          if (s.status === 'AVAILABLE') {
            return (
              <Button
                key={s.start}
                variant="outlined"
                onClick={() => onPick(s)}
                {...testProps}
              >
                {time}
              </Button>
            );
          }
          if (s.status === 'BOOKED') {
            return (
              <Button
                key={s.start}
                variant="contained"
                color="secondary"
                disabled
                {...testProps}
              >
                {time} · Booked
              </Button>
            );
          }
          // BLOCKED
          return (
            <Button
              key={s.start}
              variant="outlined"
              color="warning"
              disabled
              {...testProps}
            >
              {time} · Blocked
            </Button>
          );
        })}
      </Stack>
    </Box>
  );
}
