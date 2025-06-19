import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  Container, Box, TextField, Button, Typography, Paper, Link as MuiLink
} from '@mui/material';
import Link from 'next/link';

export default function LoginPage() {
  const signIn = async (formData) => {
    "use server";
    const email = formData.get('email')?.toString().trim();
    const password = formData.get('password')?.toString().trim();
    const supabase = createClient();

    if (!email || !password) {
      return { error: 'Email and password fields cannot be empty.' };
    }

    // Basic email format validation (can be more robust if needed)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { error: 'Please enter a valid email address.' };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Return specific error messages for better user feedback
      if (error.message.includes('Invalid login credentials')) {
        return { error: 'Incorrect email or password. Please try again.' };
      } else if (error.message.includes('Email not confirmed')) {
        return { error: 'Your email is not verified. Please check your inbox for a verification link.' };
      } else {
        return { error: error.message };
      }
    }

    // If login is successful, redirect to the dashboard
    redirect('/dashboard');
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(120deg, #f6f7f9 0%, #e3eeff 100%)'
    }}>
      <Container component="main" maxWidth="xs">
        <Paper elevation={6} sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
        }}>
          <Typography component="h1" variant="h4" sx={{
            mb: 1,
            background: 'linear-gradient(45deg, #2c3e50 0%, #3498db 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            VendHub
          </Typography>
          <Typography component="h2" variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Sign In
          </Typography>
          <Box component="form" action={signIn} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                background: 'linear-gradient(45deg, #2ecc71 0%, #27ae60 100%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #27ae60 0%, #2ecc71 100%)',
                }
              }}
            >
              Sign In
            </Button>
            <Box textAlign="center">
              <MuiLink component={Link} href="/signup" variant="body2" sx={{ color: '#3498db' }}>
                {"Don't have an account? Sign Up"}
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}