// src/app/dashboard/page.jsx
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

export default async function DashboardPage() {
  const cookieStore = await cookies(); 
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
            get(name) { return cookieStore.get(name)?.value },
            set(name, value, options) { cookieStore.set({ name, value, ...options }) },
            remove(name, options) { cookieStore.set({ name, value: '', ...options }) },
          },
        }
      )
    await supabase.auth.signOut();
    return redirect('/login');
  };

  return (
    <div>
      <header style={{ background: '#f7f7f7', borderBottom: '1px solid #ddd', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h1">Vending Dashboard</Typography>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>{user.email}</span>
          <form action={signOut}>
            <button type="submit" style={{ background: '#d32f2f', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
              Logout
            </button>
          </form>
        </div>
      </header>

      <main style={{ padding: '1.5rem' }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Location Overview
        </Typography>
        
        {locationsError && (
          <Alert severity="error">
            Error fetching locations: {locationsError.message}
          </Alert>
        )}

        {!locationsError && (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2, mt: 2 }}>
            {locations && locations.length > 0 ? (
              // --- 2. ADD .filter() HERE AS A PERMANENT FIX ---
              locations.filter(location => location.id).map((location) => (
                <Link key={location.id} href={`/dashboard/locations/${location.id}`} passHref style={{ textDecoration: 'none' }}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardActionArea sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" component="div">
                          {location.display_name || 'Unnamed Location'}
                        </Typography>
                        <Typography sx={{ mb: 1.5 }} color="text.secondary">
                          Site Code: {location.site_code}
                        </Typography>
                        <Typography variant="body2">
                          Address: {location.address || 'Not specified'}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Link>
              ))
            ) : (
              <p>No locations found.</p>
            )}
          </Box>
        )}
      </main>
    </div>
  );
}