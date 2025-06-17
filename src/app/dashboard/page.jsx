import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { Upload } from '@mui/icons-material';

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: locations, error: locationsError } = await supabase
    .from('locations')
    .select('*');

  const signOut = async () => {
    'use server';
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name, options) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    await supabase.auth.signOut();
    return redirect('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      {/* Header */}
      <Box
        component="header"
        sx={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
          px: 4,
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h5" fontWeight="bold" color="primary">
          Vending Dashboard
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body1">{user.email}</Typography>
          <form action={signOut}>
            <Button variant="contained" color="error" type="submit">
              Logout
            </Button>
          </form>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ px: 4, py: 5 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Typography variant="h4" fontWeight={600}>
            Vending Machine Locations
          </Typography>
          <Link href="/dashboard/upload" passHref>
            <Button variant="contained" startIcon={<Upload />}>
              Upload Sales Report
            </Button>
          </Link>
        </Box>

        {/* Error Display */}
        {locationsError && (
          <Alert severity="error">
            Error fetching locations: {locationsError.message}
          </Alert>
        )}

        {/* Locations List */}
        {!locationsError && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 3,
            }}
          >
            {locations && locations.filter(l => l.id).length > 0 ? (
              locations
                .filter(location => location.id)
                .map(location => (
                  <Link
                    key={location.id}
                    href={`/dashboard/locations/${location.id}`}
                    passHref
                    style={{ textDecoration: 'none' }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        borderRadius: 3,
                        transition: '0.3s',
                        '&:hover': {
                          boxShadow: 6,
                        },
                      }}
                    >
                      <CardActionArea sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {location.display_name || 'Unnamed Location'}
                          </Typography>
                          <Typography color="text.secondary">
                            Site Code: {location.site_code}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            Address: {location.address || 'Not specified'}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Link>
                ))
            ) : (
              <Typography>No locations found.</Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

