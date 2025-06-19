// src/app/(auth)/signup/page.jsx
"use client"; // This component must be a client component for state management and toast

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { signUpUser } from '@/app/actions'; // Import the new server action

import {
  Container, Box, TextField, Button, Typography, Paper, CircularProgress, Link as MuiLink
} from '@mui/material';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  // No need for createClient here since auth logic is in server action
  // const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // This client-side validation is still useful for immediate feedback
  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (event) => { // Renamed from signUp to handleSubmit for clarity
    event.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      toast.error("Email and password fields cannot be empty.");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (trimmedPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    const formData = new FormData(event.currentTarget); // Create FormData from the form

    try {
      // Call the server action directly
      const result = await signUpUser(formData);

      if (result && result.error) { // Check for error property in the returned object
        if (result.error.includes('User already registered')) {
          toast.error('An account with this email already exists.');
        } else {
          toast.error(result.error);
        }
      } else {
        toast.success("Account created! Check your email for a verification link.");
        router.push("/login"); // Client-side redirect after successful signup
      }
    } catch (err) {
      console.error('Signup error:', err);
      toast.error("An unexpected error occurred during sign-up.");
    } finally {
      setLoading(false);
    }
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
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
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
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
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