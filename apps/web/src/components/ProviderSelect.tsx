import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { FormControl, InputLabel, MenuItem, Select, Skeleton, Alert } from '@mui/material';
import { USERS_QUERY } from '../graphql/queries';

interface Props { value: string; onChange: (id: string) => void; }

export function ProviderSelect({ value, onChange }: Props) {
  const { data, loading, error } = useQuery(USERS_QUERY);
  const users = (data?.users ?? []) as { id: string; name: string }[];

  // Auto-select the first provider when users load
  useEffect(() => {
    if (!value && users.length > 0) {
      onChange(users[0].id);
    }
  }, [users, value, onChange]);

  if (loading) return <Skeleton variant="rectangular" height={56} />;
  if (error) return <Alert severity="error">{error.message}</Alert>;
  return (
    <FormControl fullWidth>
      <InputLabel id="provider-label">Provider</InputLabel>
      <Select
        labelId="provider-label"
        label="Provider"
        value={value || users[0]?.id || ''}
        onChange={(e) => onChange(e.target.value as string)}
        data-testid="provider-select"
      >
        {users.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
      </Select>
    </FormControl>
  );
}
