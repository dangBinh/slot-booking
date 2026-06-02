import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { AppNav } from './components/AppNav';
import { BookingPage } from './routes/BookingPage';
import { SettingsPage } from './routes/SettingsPage';

export function App() {
  return (
    <Box>
      <AppNav />
      <Routes>
        <Route path="/" element={<BookingPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  );
}
