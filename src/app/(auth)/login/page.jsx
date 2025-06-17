"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import {
  Container, Box, TextField, Button, Typography, Paper, CircularProgress, Link as MuiLink
} from '@mui/material';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const signIn = async (event) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      toast.error('Email and password are required.');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      const { error, data } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (error) {
        const msg = error.message.toLowerCase();

        if (msg.includes("invalid login credentials")) {
          toast.error("Incorrect email or password.");
        } else if (msg.includes("email not confirmed")) {
          toast.error("Please verify your email before logging in.");
        } else if (msg.includes("user is not allowed")) {
          toast.error("Your account has been disabled. Contact support.");
        } else {
          toast.error(`Login failed: ${error.message}`);
        }
      } else {
        toast.success('Logged in successfully!');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={6} sx={{
        mt: 8,
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: 2
      }}>
        <Typography component="h1" variant="h4" sx={{ mb: 1 }}>
          VendHub
        </Typography>
        <Typography component="h2" variant="h6" color="text.secondary">
          Sign In
        </Typography>
        <Box component="form" onSubmit={signIn} sx={{ mt: 1, width: '100%' }}>
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
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </Button>
          <Box textAlign="center">
            <MuiLink component={Link} href="/signup" variant="body2">
              {"Don't have an account? Sign Up"}
            </MuiLink>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
