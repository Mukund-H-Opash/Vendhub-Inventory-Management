"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Container, Typography, Box, Paper, CircularProgress } from '@mui/material';
import ProductTable from '@/components/dashboard/ProductTable';

export default function LocationPage({ params }) {
    const [location, setLocation] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchLocationData = async () => {
            const { data: locationData, error: locationError } = await supabase
                .from('locations')
                .select('name')
                .eq('id', params.id)
                .single();

            if (locationError) {
                console.error("Error fetching location:", locationError);
                toast.error("Could not fetch location data.");
                setLocation(null); // Explicitly set to null on error
            } else {
                setLocation(locationData);
            }
        };

        const fetchProducts = async () => {
            const { data: productData, error: productError } = await supabase
                .from('products')
                .select(`*, locations(name)`)
                .eq('location_id', params.id);

            if (productError) {
                console.error("Error fetching products:", productError);
                toast.error("Could not fetch product data for this location.");
            } else {
                setProducts(productData);
            }
        };

        const fetchData = async () => {
            setLoading(true);
            await Promise.all([fetchLocationData(), fetchProducts()]);
            setLoading(false);
        };

        fetchData();
    }, [params.id, supabase]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }
    
    if (!location) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h5" color="text.secondary" align="center">
                    Location data could not be loaded.
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
                <Typography variant="h4" gutterBottom component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Products at {location.name}
                </Typography>
                <ProductTable products={products} />
            </Paper>
        </Container>
    );
}