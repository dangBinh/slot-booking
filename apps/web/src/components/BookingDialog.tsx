import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, Alert } from '@mui/material';
import { CREATE_BOOKING_MUTATION } from '../graphql/mutations';
import { SLOTS_QUERY } from '../graphql/queries';

interface Slot { userId: string; start: string; end: string; }
interface Props {
  slot: Slot | null;
  rangeFrom: Date;
  rangeTo: Date;
  onClose: () => void;
  onBooked: () => void;
}

export function BookingDialog({ slot, rangeFrom, rangeTo, onClose, onBooked }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [createBooking, { loading, error }] = useMutation(CREATE_BOOKING_MUTATION, {
    refetchQueries: [{
      query: SLOTS_QUERY,
      variables: { userId: slot?.userId, from: rangeFrom.toISOString(), to: rangeTo.toISOString() },
    }],
    awaitRefetchQueries: true,
  });

  if (!slot) return null;

  const submit = async () => {
    await createBooking({
      variables: { input: { userId: slot.userId, startAt: slot.start, customerName: name, customerEmail: email } },
    });
    setName(''); setEmail('');
    onBooked();
  };

  return (
    <Dialog open={!!slot} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Book {new Date(slot.start).toISOString().replace('T', ' ').slice(0, 16)} UTC</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Your name" value={name} onChange={(e) => setName(e.target.value)} inputProps={{ 'data-testid': 'customer-name' }} />
          <TextField label="Your email" value={email} onChange={(e) => setEmail(e.target.value)} inputProps={{ 'data-testid': 'customer-email' }} />
          {error && <Alert severity="error">{String(error.graphQLErrors[0]?.extensions?.code ?? error.message)}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={submit} variant="contained" disabled={loading || !name || !email} data-testid="confirm-booking">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
