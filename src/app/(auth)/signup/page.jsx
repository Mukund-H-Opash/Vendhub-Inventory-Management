// src/app/(auth)/signup/page.jsx
'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Toaster, toast } from 'react-hot-toast';

// MUI Components
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';


// Copyright component for the bottom of the page
function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="#">
        Vending Frontend
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}


export default function SignUp() {
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');

    // Supabase sign-up logic
    const { error } = await supabase.auth.signUp({
      email,
      password,
      // You can add options here if you want to redirect the user
      // to a specific page after they confirm their email.
      // options: {
      //   emailRedirectTo: 'http://localhost:3000/login',
      // },
    });

    if (error) {
      if (error.message.includes('User already registered')) {
        toast.error('Error: This email is already registered. Please try logging in or use a different email.');
      } else {
        toast.error('Error: ' + error.message);
      }
      return;
    }
    
    // On successful sign-up, show a confirmation message.
    toast.success('Success! Please check your email to confirm your account.'); // Use toast.success for success messages
    router.push('/login'); // Redirect to login page after successful signup
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
              />
            </Grid>
          </Grid>
          
          {/* Display success or error messages */}
          {/* {message && (
            <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
              {message}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )} */}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link href="/login" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Copyright sx={{ mt: 5 }} />
      <Toaster /> {/* Add the Toaster component here */}
    </Container>
  );
}