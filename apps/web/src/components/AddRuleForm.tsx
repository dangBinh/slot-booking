import { useState } from 'react';
import { useMutation } from '@apollo/client';
import {
  Box, Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Alert, Typography,
} from '@mui/material';
import {
  AVAILABILITY_RULES_QUERY,
  CREATE_AVAILABILITY_MUTATION,
} from '../graphql/availability';

interface Props {
  userId: string;
}

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function AddRuleForm({ userId }: Props) {
  const [weekday, setWeekday] = useState<number>(1);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [duration, setDuration] = useState<number>(30);

  const [createRule, { loading, error, reset }] = useMutation(CREATE_AVAILABILITY_MUTATION, {
    refetchQueries: [{ query: AVAILABILITY_RULES_QUERY, variables: { userId } }],
    awaitRefetchQueries: true,
    update(cache) { cache.evict({ fieldName: 'slots' }); cache.gc(); },
  });

  if (!userId) return null;

  const submit = async () => {
    try {
      await createRule({
        variables: { input: { userId, weekday, startTime, endTime, slotDurationMinutes: duration } },
      });
      setWeekday(1); setStartTime('09:00'); setEndTime('10:00'); setDuration(30);
    } catch {
      // error rendered below via useMutation `error`
    }
  };

  return (
    <Box data-testid="add-rule-form">
      <Typography variant="subtitle1" gutterBottom>Add a rule</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="weekday-label">Weekday</InputLabel>
          <Select
            labelId="weekday-label"
            label="Weekday"
            value={weekday}
            onChange={(e) => setWeekday(Number(e.target.value))}
            inputProps={{ 'data-testid': 'rule-weekday' }}
          >
            {WEEKDAY.map((w, i) => <MenuItem key={w} value={i}>{w}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField
          size="small" type="time" label="Start" value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          inputProps={{ 'data-testid': 'rule-start' }}
        />
        <TextField
          size="small" type="time" label="End" value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          inputProps={{ 'data-testid': 'rule-end' }}
        />
        <TextField
          size="small" type="number" label="Slot (min)" value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          inputProps={{ min: 1, 'data-testid': 'rule-duration' }}
        />
        <Button
          variant="contained" onClick={submit} disabled={loading}
          data-testid="rule-add"
        >
          Add
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
