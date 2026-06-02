import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Container, Stack, Typography, Snackbar, Grid, Skeleton, Alert } from '@mui/material';
import { ProviderSelect } from '../components/ProviderSelect';
import { MonthCalendar } from '../components/MonthCalendar';
import { DaySlotList } from '../components/DaySlotList';
import { BookingDialog } from '../components/BookingDialog';
import { SLOTS_QUERY } from '../graphql/queries';
import { groupSlotsByDay, type Slot } from '../lib/groupSlotsByDay';

function firstOfThisMonthUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

function nextMonthStartUTC(month: Date): Date {
  return new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1));
}

function toKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function BookingPage() {
  const [userId, setUserId] = useState('');
  const [month, setMonth] = useState<Date>(firstOfThisMonthUTC);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [picked, setPicked] = useState<Slot | null>(null);
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);

  const monthStart = month;
  const monthEnd = useMemo(() => nextMonthStartUTC(month), [month]);

  const { data, loading, error } = useQuery<{ slots: Slot[] }>(SLOTS_QUERY, {
    variables: { userId, from: monthStart.toISOString(), to: monthEnd.toISOString() },
    skip: !userId,
    fetchPolicy: 'cache-and-network',
  });

  const slotsByDay = useMemo(() => groupSlotsByDay(data?.slots ?? []), [data]);
  const availableDays = useMemo(() => {
    const out = new Set<string>();
    for (const [day, daySlots] of slotsByDay) {
      if (daySlots.some(s => s.status === 'AVAILABLE')) out.add(day);
    }
    return out;
  }, [slotsByDay]);

  useEffect(() => {
    if (selectedDay && availableDays.has(toKey(selectedDay))) return;
    const firstKey = slotsByDay.keys().next().value as string | undefined;
    if (!firstKey) { setSelectedDay(null); return; }
    setSelectedDay(new Date(`${firstKey}T00:00:00.000Z`));
  }, [slotsByDay]);

  useEffect(() => { setSelectedDay(null); }, [month, userId]);

  const daySlots = selectedDay ? (slotsByDay.get(toKey(selectedDay)) ?? []) : [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Slot Booking</Typography>
      <Stack spacing={3}>
        <ProviderSelect value={userId} onChange={setUserId} />
        {userId && error && <Alert severity="error">{error.message}</Alert>}
        {userId && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={5}>
              {loading && !data ? (
                <Skeleton variant="rectangular" height={320} />
              ) : (
                <MonthCalendar
                  month={month}
                  availableDays={availableDays}
                  selectedDay={selectedDay}
                  onMonthChange={(next) => setMonth(new Date(Date.UTC(next.getUTCFullYear(), next.getUTCMonth(), 1)))}
                  onDaySelect={setSelectedDay}
                />
              )}
            </Grid>
            <Grid item xs={12} md={7}>
              {!loading && data && availableDays.size === 0 ? (
                <Alert severity="info">No slots available this month.</Alert>
              ) : (
                <DaySlotList day={selectedDay} slots={daySlots} onPick={setPicked} />
              )}
            </Grid>
          </Grid>
        )}
      </Stack>
      <BookingDialog
        slot={picked}
        rangeFrom={monthStart}
        rangeTo={monthEnd}
        onClose={() => setPicked(null)}
        onBooked={() => { setConfirmedAt(picked?.start ?? null); setPicked(null); }}
      />
      <Snackbar
        open={!!confirmedAt}
        autoHideDuration={4000}
        onClose={() => setConfirmedAt(null)}
        message={confirmedAt ? `Booked ${confirmedAt}` : ''}
        data-testid="booking-confirmation"
      />
    </Container>
  );
}
