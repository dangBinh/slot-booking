import { useState } from 'react';
import { Container, Stack, Typography, Divider } from '@mui/material';
import { ProviderSelect } from '../components/ProviderSelect';
import { RulesList } from '../components/RulesList';
import { AddRuleForm } from '../components/AddRuleForm';
import { BlackoutsSection } from '../components/BlackoutsSection';

export function SettingsPage() {
  const [userId, setUserId] = useState('');
  return (
    <Container maxWidth="md" sx={{ py: 4 }} data-testid="settings-page">
      <Typography variant="h4" gutterBottom>Availability Settings</Typography>
      <Stack spacing={3}>
        <ProviderSelect value={userId} onChange={setUserId} />
        <RulesList userId={userId} />
        <Divider />
        <AddRuleForm userId={userId} />
        <Divider />
        <BlackoutsSection userId={userId} />
      </Stack>
    </Container>
  );
}
