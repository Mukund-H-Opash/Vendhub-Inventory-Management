// src/components/dashboard/LocationList.jsx
import { createClient } from '@/lib/supabase/server';

// MUI components for styling
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

// This is an async Server Component
export default async function LocationList() {
  const supabase = createClient();

  // Fetch data from the 'locations' table
  const { data: locations, error } = await supabase.from('locations').select('*');

  if (error) {
    return <Alert severity="error">Error fetching locations: {error.message}</Alert>;
  }

  if (!locations || locations.length === 0) {
    return <p>No locations found. Add one to get started.</p>;
  }

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2 }}>
      {locations.map((location) => (
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
      ))}
    </Box>
  );
}