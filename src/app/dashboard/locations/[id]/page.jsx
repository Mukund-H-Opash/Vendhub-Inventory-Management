// src/app/dashboard/locations/[id]/page.jsx
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';


import {
    Typography,
    Alert,
    Button
} from '@mui/material';

import InventoryTable from '@/components/dashboard/InventoryTable';

// This page receives `params` from the URL, which contains the dynamic `id`
export default async function LocationDetailPage({ params }) {
  const awaitedParams = await params; // Await params as required by Next.js
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

  // --- DATA FETCHING ---
  const { data: location, error: locationError } = await supabase
    .from('locations')
    .select('*')
    .eq('id', awaitedParams.id)
    .single();

  const { data: inventory, error: inventoryError } = await supabase
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
    .eq('location_id', awaitedParams.id)
    .order('stock_level', { ascending: false });

  const error = locationError || inventoryError;

  // --- RENDER THE PAGE ---
  return (
    <main style={{ padding: '1.5rem', maxWidth: '900px', margin: 'auto' }}>
      <Link href="/dashboard">
        <Button variant="outlined" sx={{ mb: 3 }}>
          ← Back to All Locations
        </Button>
      </Link>
      
      {error && (
        <Alert severity="error">Error fetching data: {error.message}</Alert>
      )}

      {location && (
        <>
          <Typography variant="h4" gutterBottom>
            Inventory for: {location.display_name}
          </Typography>
          <Typography color="text.secondary" gutterBottom>
            Site Code: {location.site_code}
          </Typography>
        </>
      )}

      {!error && (
        <InventoryTable initialInventory={inventory} />
      )}
    </main>
  );
}
