"use client";

import { useState } from 'react';
import { Button, Input, Box, CircularProgress } from '@mui/material';
import { UploadFile } from '@mui/icons-material';
import { processCsvFile } from '@/app/actions';
import toast from 'react-hot-toast';

export default function UploadForm() {
    const [isSubmitting, setSubmitting] = useState(false);
    const [file, setFile] = useState(null);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== 'text/csv') {
                toast.error("Invalid file type. Please upload a CSV file.");
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!file) {
            toast.error('Please select a file to upload.');
            return;
        }

        setSubmitting(true);
        const formData = new FormData();
        formData.append('csvFile', file);

        const toastId = toast.loading('Processing file...');

        try {
            const result = await processCsvFile(formData);
            toast.success(`Successfully processed ${result.processedRows} rows!`, { id: toastId });
            // Redirect or refresh
             window.location.href = '/dashboard';
        } catch (e) {
            console.error('File processing error:', e);
            toast.error(e.message || 'An unexpected error occurred.', { id: toastId });
        } finally {
            setSubmitting(false);
            setFile(null);
            event.target.reset(); // Clear the file input
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button component="label" variant="outlined" startIcon={<UploadFile />}>
                    {file ? file.name : 'Choose CSV File'}
                    <Input type="file" onChange={handleFileChange} sx={{ display: 'none' }} inputProps={{ accept: ".csv" }}/>
                </Button>

                <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting || !file}
                    sx={{ mt: 2 }}
                >
                    {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Process Sales Data'}
                </Button>
            </Box>
        </form>
    );
}