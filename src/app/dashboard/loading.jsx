// src/app/dashboard/loading.jsx
'use client';

import { Box, CircularProgress, Typography } from '@mui/material';

export default function Loading() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh', // Take up most of the viewport height
        textAlign: 'center',
      }}
    >
      <CircularProgress size={60} sx={{ mb: 2 }} />
      <Typography variant="h6" color="text.secondary">
        Loading data...
      </Typography>
    </Box>
  );
}