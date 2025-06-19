// src/app/dashboard/upload/page.jsx
'use client';

import { Typography, Box, Paper , Button } from '@mui/material';
import UploadForm from '@/components/dashboard/UploadForm';
import Link from 'next/link';


export default function UploadPage() {
  return (
    <Box

    
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #f5f7fa, #c3cfe2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >

      <Box sx={{ mb: 3 ,width: '100%',
          maxWidth: 800,}}>
        <Link href="/dashboard" passHref>
          <Button variant="outlined">← Back to Dashboard </Button>
        </Link>
      </Box>

      <Paper
        elevation={6}
        sx={{
          p: { xs: 3, md: 5 },
          maxWidth: 800,
          width: '100%',
          borderRadius: 4,
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
          backgroundColor: '#ffffff',
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#1e3a5f',
            fontSize: { xs: '2rem', md: '2.75rem' },
          }}
        >
          Upload Sales CSV
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            mb: 4,
            textAlign: 'center',
            maxWidth: 600,
            mx: 'auto',
            fontSize: { xs: '0.95rem', md: '1rem' },
          }}
        >
          Upload a sales report from Vendor A (iOS Vending) or Vendor B (Cantaloupe Systems). 
      update inventory automatically.
        </Typography>

        <Box
          sx={{
            border: '2px dashed #90caf9',
            borderRadius: 3,
            p: { xs: 2, md: 3 },
            backgroundColor: '#f0f8ff',
            transition: '0.3s',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: '#e3f2fd',
              borderColor: '#42a5f5',
            },
          }}
        >
          <UploadForm />
        </Box>
      </Paper>
    </Box>
  );
}
