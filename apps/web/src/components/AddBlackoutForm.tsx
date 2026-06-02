import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  BLACKOUT_SLOTS_QUERY,
  CREATE_BLACKOUT_MUTATION,
} from '../graphql/blackouts';

interface Props {
  userId: string;
  from: Date;
  to: Date;
}

function todayUTCDate(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function composeStartAt(day: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  return new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), h, m, 0));
}

export function AddBlackoutForm({ userId, from, to }: Props) {
  const [day, setDay] = useState<Date | null>(todayUTCDate());
  const [time, setTime] = useState('10:00');

  const variables = { userId, from: from.toISOString(), to: to.toISOString() };
  const [createBlackout, { loading, error, reset }] = useMutation(CREATE_BLACKOUT_MUTATION, {
    refetchQueries: [{ query: BLACKOUT_SLOTS_QUERY, variables }],
    awaitRefetchQueries: true,
    update(cache) { cache.evict({ fieldName: 'slots' }); cache.gc(); },
  });

  if (!userId) return null;

  const submit = async () => {
    if (!day) return;
    const startAt = composeStartAt(day, time);
    try {
      await createBlackout({ variables: { input: { userId, startAt: startAt.toISOString() } } });
      setTime('10:00');
    } catch {
      // error rendered below
    }
  };

  return (
    <Box data-testid="add-blackout-form">
      <Typography variant="subtitle1" gutterBottom>Block a slot</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
        <DatePicker
          label="Date (UTC)"
          value={day}
          onChange={(d) => setDay(d)}
          slotProps={{ textField: { size: 'small', inputProps: { 'data-testid': 'blackout-date' } } }}
        />
        <TextField
          size="small" type="time" label="Time" value={time}
          onChange={(e) => setTime(e.target.value)}
          inputProps={{ 'data-testid': 'blackout-time' }}
        />
        <Button
          variant="contained" onClick={submit} disabled={loading || !day}
          data-testid="blackout-add"
        >
          Block
        </Button>
      </Stack>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => reset()}>
          {String(error.graphQLErrors[0]?.extensions?.code ?? error.message)}
        </Alert>
      )}
    </Box>
  );
}
