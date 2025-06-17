// src/app/dashboard/locations/[id]/page.jsx
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';

// MUI Components for a nice table display
import {
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    Button
} from '@mui/material';

// This page receives `params` from the URL, which contains the dynamic `id`
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

  // --- DATA FETCHING ---
  // 1. Fetch the details for this specific location
  const { data: location, error: locationError } = await supabase
    .from('locations')
    .select('*')
    .eq('id', params.id)
    .single(); // .single() expects one result, which is perfect here

  // 2. Fetch the inventory, joining with the products table to get product names
  const { data: inventory, error: inventoryError } = await supabase
    .from('inventory')
    .select(`
      stock_level,
      products (
        display_name,
        upc,
        unit_price
      )
    `)
    .eq('location_id', params.id)
    .order('stock_level', { ascending: false }); // Optional: sort by stock level

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
        <TableContainer component={Paper} variant="outlined" sx={{ mt: 4 }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f7f7f7' }}>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell>UPC</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Current Stock</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventory && inventory.length > 0 ? (
                inventory.map((item, index) => (
                  <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row">
                      {item.products.display_name}
                    </TableCell>
                    <TableCell>{item.products.upc}</TableCell>
                    <TableCell align="right">${item.products.unit_price}</TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold">{item.stock_level}</Typography>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No inventory data found for this location.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </main>
  );
}