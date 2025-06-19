import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  Container, Box, TextField, Button, Typography, Paper, Link as MuiLink
} from '@mui/material';
import Link from 'next/link';

export default function SignupPage() {
  const signUp = async (formData) => {
    "use server";
    const email = formData.get('email')?.toString().trim();
    const password = formData.get('password')?.toString().trim();
    const supabase = await createClient();

    if (!email || !password) {
      return { error: "Email and password fields cannot be empty." };
    }

    // Basic email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { error: "Please enter a valid email address." };
    }

    if (password.length < 6) {
      return { error: "Password must be at least 6 characters long." };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('User already registered')) {
        return { error: 'An account with this email already exists.' };
      } else {
        return { error: error.message };
      }
    }

    // If signup is successful, redirect to the login page
    redirect("/login");
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
            Create Account
          </Typography>
          <Box component="form" action={signUp} sx={{ mt: 1, width: '100%' }}>
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
              autoComplete="new-password"
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
              Sign Up
            </Button>
            <Box textAlign="center">
              <MuiLink component={Link} href="/login" variant="body2" sx={{ color: '#3498db' }}>
                {"Already have an account? Sign In"}
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}