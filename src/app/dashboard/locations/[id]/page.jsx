// src/app/dashboard/locations/[id]/page.jsx
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import {
  Typography,
  Alert,
  Button,
  Paper,
  Box,
  Divider,
} from '@mui/material';
import ProductSalesTable from '@/components/dashboard/ProductSalesTable'; // We will create this new component

export default async function LocationDetailPage({ params }) {
  const supabase = createClient();
  let location = null;
  let sales = [];
  let error = null;

  try {
    const locationId = params?.id;
    if (!locationId) {
      throw new Error("Invalid location ID.");
    }

    // Step 1: Fetch the location's details to get its site_code
    const { data: locData, error: locError } = await supabase
      .from('locations')
      .select('site_code, display_name')
      .eq('id', locationId)
      .single();

    if (locError) {
      if (locError.code === 'PGRST116') throw new Error("Location not found.");
      throw locError;
    }
    location = locData;

    // Step 2: Fetch ALL sales records from the 'products' table for this location
    const { data: salesData, error: salesError } = await supabase
      .from('products')
      .select('*') // Select all columns
      .eq('site_code', location.site_code)
      .order('sale_date', { ascending: false }); // Show most recent sales first

    if (salesError) {
      throw salesError;
    }
    sales = salesData;

  } catch (err) {
    console.error('[LocationDetailPage Error]', err.message);
    error = { message: err.message };
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1200px', mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Link href="/dashboard" passHref>
          <Button variant="outlined">← Back to All Locations</Button>
        </Link>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message || 'An unexpected error occurred.'}
        </Alert>
      )}

      {!error && location && (
        <>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Sales History for {location.display_name}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body1" color="text.secondary">
              <strong>Site Code:</strong> {location.site_code}
            </Typography>
          </Paper>

          <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            {sales?.length > 0 ? (
              // Step 3: Render the new component with the full sales data
              <ProductSalesTable salesData={sales} />
            ) : (
              <Typography sx={{ p: 3, textAlign: 'center' }} color="text.secondary">
                No sales have been recorded for this location yet.
              </Typography>
            )}
          </Paper>
        </>
      )}
    </Box>
  );
}