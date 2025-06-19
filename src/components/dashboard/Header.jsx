// src/components/dashboard/Header.jsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  AccountCircle,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import LogoutButton from './LogoutButton';

export default async function Header() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  return (
    <AppBar 
      position="static"
      sx={{
        background: 'linear-gradient(90deg, #2c3e50 0%, #3498db 100%)',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DashboardIcon sx={{ color: '#fff', fontSize: 32 }} />
          <Typography variant="h5" fontWeight="bold" sx={{ color: '#fff' }}>
            Dashboard
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountCircle sx={{ color: '#fff' }} />
            <Typography variant="body1" sx={{ color: '#fff' }}>
              {user.email}
            </Typography>
          </Box>
          
          <LogoutButton />
        </Box>
      </Toolbar>
    </AppBar>
  );
}