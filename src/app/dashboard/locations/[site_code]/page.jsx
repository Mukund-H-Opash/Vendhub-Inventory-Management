// src/app/dashboard/locations/[site_code]/page.jsx
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
// Ensure you have this component created at the path below
import ProductSalesTable from '@/components/dashboard/ProductSalesTable'; 

export default async function LocationDetailPage({ params }) {
  const supabase = createClient();
  let sales = [];
  let error = null;

  // --- THIS IS THE FIX ---
  // We get the site_code directly from the URL params, which now works
  // because you renamed the folder to [site_code].
  const siteCode = params.site_code;

  try {
    if (!siteCode) {
      // This error will no longer happen if the folder is named correctly
      throw new Error("Invalid or missing location site code.");
    }

    // We no longer need to fetch from the 'locations' table first.
    // We can directly query the 'products' table with the site_code.
    const { data: salesData, error: salesError } = await supabase
      .from('products')
      .select('*') // Select all columns from the sales transaction
      .eq('site_code', siteCode)
      .order('sale_date', { ascending: false }); // Show most recent sales first

    if (salesError) {
      throw salesError;
    }
    sales = salesData;

  } catch (err) {
    console.error(`[LocationDetailPage Error for ${siteCode}]`, err.message);
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

      {!error && (
        <>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Sales History for Location
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h5" color="text.secondary">
              Site Code: <strong>{siteCode}</strong>
            </Typography>
          </Paper>

          <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            {sales?.length > 0 ? (
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