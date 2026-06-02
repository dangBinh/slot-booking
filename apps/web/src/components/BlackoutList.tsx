import { useMutation, useQuery } from '@apollo/client';
import {
  Alert, Box, IconButton, List, ListItem, ListItemText, Skeleton, Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  BLACKOUT_SLOTS_QUERY,
  DELETE_BLACKOUT_MUTATION,
} from '../graphql/blackouts';

interface Props {
  userId: string;
  from: Date;
  to: Date;
}

interface Blackout {
  id: string;
  userId: string;
  startAt: string;
  endAt: string;
}

const FMT = new Intl.DateTimeFormat('en-US', {
  weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC',
});

export function BlackoutList({ userId, from, to }: Props) {
  const variables = { userId, from: from.toISOString(), to: to.toISOString() };
  const { data, loading, error } = useQuery<{ blackoutSlots: Blackout[] }>(BLACKOUT_SLOTS_QUERY, {
    variables, skip: !userId, fetchPolicy: 'cache-and-network',
  });
  const [deleteBlackout, { loading: deleting }] = useMutation(DELETE_BLACKOUT_MUTATION, {
    refetchQueries: [{ query: BLACKOUT_SLOTS_QUERY, variables }],
    awaitRefetchQueries: true,
    update(cache) { cache.evict({ fieldName: 'slots' }); cache.gc(); },
  });

  if (!userId) return null;
  if (loading && !data) return <Skeleton variant="rectangular" height={80} />;
  if (error) return <Alert severity="error">{error.message}</Alert>;

  const items = data?.blackoutSlots ?? [];
  if (items.length === 0) {
    return <Alert severity="info" data-testid="blackouts-empty">No blackouts.</Alert>;
  }

  return (
    <Box data-testid="blackouts-list">
      <Typography variant="subtitle1" gutterBottom>Blackouts (next 30 days)</Typography>
      <List dense>
        {items.map(b => {
          const day = FMT.format(new Date(b.startAt));
          const time = `${b.startAt.slice(11, 16)}–${b.endAt.slice(11, 16)}`;
          return (
            <ListItem
              key={b.id}
              data-testid={`blackout-${b.id}`}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  disabled={deleting}
                  onClick={() => deleteBlackout({ variables: { id: b.id } })}
                  data-testid={`blackout-delete-${b.id}`}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText primary={`${day} (UTC)`} secondary={time} />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}
