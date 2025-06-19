// src/app/dashboard/layout.jsx

import Box from '@mui/material/Box';
import "@/app/globals.css"
export default function DashboardLayout({ children }) {
  return (
    <Box sx={{ display: 'flex' }}>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0, 
          backgroundColor: 'background.default',
          minHeight: '100vh',
        }}
      >

        {children}
      </Box>
    </Box>
  );
}
