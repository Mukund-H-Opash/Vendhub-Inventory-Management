// src/app/dashboard/locations/[id]/page.jsx
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';

import {
  Typography,
  Alert,
  Button,
  Paper,
  Box,
  Divider,
  Skeleton,
} from '@mui/material';

import InventoryTable from '@/components/dashboard/InventoryTable';

export default async function LocationDetailPage({ params }) {
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

  let location = null;
  let inventory = [];
  let error = null;

  try {
    const locationId = params?.id;

    if (!locationId) {
      throw new Error("Invalid or missing location ID.");
    }

    // Fetch location
    const { data: locData, error: locError } = await supabase
      .from('locations')
      .select('*')
      .eq('id', locationId)
      .single();

    if (locError && locError.code === 'PGRST116') {
      // Not found
      throw new Error("Location not found.");
    } else if (locError) {
      throw locError;
    }

    location = locData;

    // Fetch inventory
    const { data: invData, error: invError } = await supabase
      .from('inventory')
      .select(`
        id,
        stock_level,
        products (
          display_name,
          upc,
          unit_price
        )
      `)
      .eq('location_id', locationId)
      .order('stock_level', { ascending: false });

    if (invError) {
      throw invError;
    }

    inventory = invData;
  } catch (err) {
    console.error('[LocationDetailPage Error]', err.message);
    error = err;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1000px', mx: 'auto' }}>
      {/* Back Button */}
      <Box sx={{ mb: 3 }}>
        <Link href="/dashboard" passHref>
          <Button variant="outlined">← Back to All Locations</Button>
        </Link>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message || 'Something went wrong while loading the location data.'}
        </Alert>
      )}

      {/* Location Info */}
      {!error && location ? (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Inventory – {location.display_name}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body1" color="text.secondary">
            <strong>Site Code:</strong> {location.site_code}
          </Typography>
          {location.address && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              <strong>Address:</strong> {location.address}
            </Typography>
          )}
        </Paper>
      ) : null}

      {/* Inventory Table */}
      {!error && location ? (
        <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
          {inventory?.length > 0 ? (
            <InventoryTable initialInventory={inventory} />
          ) : (
            <Typography variant="body2" color="text.secondary">
              No inventory available for this location.
            </Typography>
          )}
        </Paper>
      ) : null}
    </Box>
  );
}
