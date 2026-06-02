import { useQuery, useMutation } from '@apollo/client';
import {
  Alert, IconButton, List, ListItem, ListItemText, Skeleton, Typography, Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  AVAILABILITY_RULES_QUERY,
  DELETE_AVAILABILITY_MUTATION,
} from '../graphql/availability';

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Rule {
  id: string;
  userId: string;
  weekday: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

interface Props {
  userId: string;
}

export function RulesList({ userId }: Props) {
  const { data, loading, error } = useQuery<{ availabilityRules: Rule[] }>(AVAILABILITY_RULES_QUERY, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: 'cache-and-network',
  });
  const [deleteRule, { loading: deleting }] = useMutation(DELETE_AVAILABILITY_MUTATION, {
    refetchQueries: [{ query: AVAILABILITY_RULES_QUERY, variables: { userId } }],
    awaitRefetchQueries: true,
    update(cache) { cache.evict({ fieldName: 'slots' }); cache.gc(); },
  });

  if (!userId) return null;
  if (loading && !data) return <Skeleton variant="rectangular" height={120} />;
  if (error) return <Alert severity="error">{error.message}</Alert>;

  const rules = data?.availabilityRules ?? [];
  if (rules.length === 0) {
    return <Alert severity="info" data-testid="rules-empty">No rules yet. Add one below.</Alert>;
  }

  const sorted = [...rules].sort((a, b) =>
    a.weekday - b.weekday || a.startTime.localeCompare(b.startTime),
  );

  return (
    <Box data-testid="rules-list">
      <Typography variant="subtitle1" gutterBottom>Existing rules</Typography>
      <List dense>
        {sorted.map(r => (
          <ListItem
            key={r.id}
            data-testid={`rule-${r.id}`}
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="delete"
                disabled={deleting}
                onClick={() => deleteRule({ variables: { id: r.id } })}
                data-testid={`rule-delete-${r.id}`}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={`${WEEKDAY[r.weekday]}: ${r.startTime}–${r.endTime}`}
              secondary={`${r.slotDurationMinutes} min slots`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
