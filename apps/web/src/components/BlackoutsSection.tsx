import { useMemo } from 'react';
import { Stack, Divider } from '@mui/material';
import { BlackoutList } from './BlackoutList';
import { AddBlackoutForm } from './AddBlackoutForm';

interface Props {
  userId: string;
}

export function BlackoutsSection({ userId }: Props) {
  const { from, to } = useMemo(() => {
    const now = new Date();
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const to = new Date(from);
    to.setUTCDate(to.getUTCDate() + 30);
    return { from, to };
  }, []);

  return (
    <Stack spacing={2} data-testid="blackouts-section">
      <BlackoutList userId={userId} from={from} to={to} />
      <Divider />
      <AddBlackoutForm userId={userId} from={from} to={to} />
    </Stack>
  );
}
