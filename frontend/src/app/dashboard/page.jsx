// src/app/(dashboard)/page.jsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// Import the MUI components we need for the UI
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

export default async function DashboardPage() {
  const supabase = createClient();

  // 1. Check for an active user session (no changes here)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. If the user is not logged in, redirect (no changes here)
  if (!user) {
    redirect('/login');
  }

  // 3. NEW: Fetch data from the 'locations' table
  const { data: locations, error: locationsError } = await supabase
    .from('locations')
    .select('*');

  // 4. Define the logout function as a Server Action (no changes here)
  const signOut = async () => {
    'use server';
    const supabase = createClient();
    await supabase.auth.signOut();
    return redirect('/login');
  };

  // 5. Render the page with the new data display
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
        
        {/* Check for errors during data fetching */}
        {locationsError && (
          <Alert severity="error">
            Error fetching locations: {locationsError.message}
          </Alert>
        )}

        {/* If no error, display the locations */}
        {!locationsError && (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2, mt: 2 }}>
            {locations && locations.length > 0 ? (
              locations.map((location) => (
                <Card key={location.id} variant="outlined">
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
                </Card>
              ))
            ) : (
              <p>No locations found. Add one in the Supabase table editor to get started.</p>
            )}
          </Box>
        )}
      </main>
    </div>
  );
}