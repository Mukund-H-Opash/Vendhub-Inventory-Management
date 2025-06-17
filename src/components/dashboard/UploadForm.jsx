// src/components/dashboard/UploadForm.jsx
"use client";

import { useState } from 'react';
import { Button, Input, Box, CircularProgress, Alert, Typography } from '@mui/material';
import { UploadFile } from '@mui/icons-material';
import { processCsvFile } from '@/lib/actions'; 
import toast from 'react-hot-toast';

export default function UploadForm() {
    const [isSubmitting, setSubmitting] = useState(false);
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = (event) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== 'text/csv') {
                setError('Invalid file type. Please upload a CSV file.');
                setFile(null);
            } else {
                setFile(selectedFile);
                setError('');
            }
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!file) {
            setError('Please select a file to upload.');
            return;
        }

        setSubmitting(true);
        setError('');

        const formData = new FormData();
        formData.append('csvFile', file);

        try {
            const result = await processCsvFile(formData);

            if (result?.error) {
                toast.error(`Processing failed: ${result.error}`);
                setError(result.error);
            } else {
                toast.success(`Processing complete! ${result.updatedRows} inventory records updated.`);
            }
        } catch (e) {
            const errorMessage = 'An unexpected error occurred during file processing.';
            toast.error(errorMessage);
            setError(errorMessage);
            console.error(e);
        }

        setSubmitting(false);
        setFile(null);
        event.target.reset(); // Clear the file input
    };

    return (
        <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                    component="label"
                    variant="outlined"
                    startIcon={<UploadFile />}
                    fullWidth
                >
                    {file ? 'Change File' : 'Choose CSV File'}
                    <Input
                        type="file"
                        onChange={handleFileChange}
                        sx={{ display: 'none' }}
                        inputProps={{ accept: ".csv" }}
                    />
                </Button>
                {file && (
                    <Typography variant="body2" color="text.secondary" align="center">
                        Selected: <strong>{file.name}</strong>
                    </Typography>
                )}

                {error && <Alert severity="error">{error}</Alert>}

                <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting || !file}
                    fullWidth
                >
                    {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Process Sales Data'}
                </Button>
            </Box>
        </form>
    );
}