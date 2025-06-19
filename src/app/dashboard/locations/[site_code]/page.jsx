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
import ProductSalesTable from '@/components/dashboard/ProductSalesTable'; 
import Header from "@/components/dashboard/Header"; 


export default async function LocationDetailPage(props) {
  
  const supabase = await createClient();
  let sales = [];
  let error = null;

  const {
      data: { user },
    } = await supabase.auth.getUser();
  
    if (!user) {
      redirect("/login");
    }
  
    const { data: locations, error: locationsError } = await supabase.rpc(
      "get_unique_location_site_codes"
    );
  
  

  const params = await props.params;
  const siteCode = params.site_code;
  

  try {
    if (!siteCode) {
      throw new Error("Invalid or missing location site code.");
    }
    
    const { data: salesData, error: salesError } = await supabase
      .from('products')
      .select('*') 
      .eq('site_code', siteCode)
      .order('sale_date', { ascending: false }); 

    if (salesError) {
      throw salesError;
    }
    sales = salesData;

  } catch (err) {
    console.error(`[LocationDetailPage Error for ${siteCode}]`, err.message);
    error = { message: err.message };
  }

  return (
    <>
    <Header user={user} />
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
    </>
  );
}