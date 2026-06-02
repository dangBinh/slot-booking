import { AppBar, Tabs, Tab, Toolbar } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

export function AppNav() {
  const { pathname } = useLocation();
  const value = pathname.startsWith('/settings') ? '/settings' : '/';
  return (
    <AppBar position="static" color="default" elevation={0}>
      <Toolbar variant="dense">
        <Tabs value={value} aria-label="primary navigation">
          <Tab label="Booking" value="/" component={Link} to="/" />
          <Tab label="Settings" value="/settings" component={Link} to="/settings" data-testid="nav-settings" />
        </Tabs>
      </Toolbar>
    </AppBar>
  );
}
