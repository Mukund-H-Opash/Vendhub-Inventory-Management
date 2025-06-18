// src/components/dashboard/UploadForm.jsx
"use client";

import { useState } from 'react';
import { Button, Input, Box, CircularProgress, Alert, Typography } from '@mui/material';
import { UploadFile } from '@mui/icons-material';
import { processCsvFile } from '@/app/actions'; 
import toast from 'react-hot-toast';

export default function UploadForm() {
    const [isSubmitting, setSubmitting] = useState(false);
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleFileChange = (event) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(''); // Clear previous errors/success messages
            setSuccessMessage('');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!file) {
            toast.error('Please select a file to upload.');
            return;
        }

        setSubmitting(true);
        setError('');
        setSuccessMessage('');

        const formData = new FormData();
        formData.append('csvFile', file);

        try {
            const result = await processCsvFile(formData);

            // --- THIS IS THE UPDATED LOGIC ---
            if (result?.error) {
                // Handle a failure response
                const displayError = result.details ? `${result.error} - ${result.details}` : result.error;
                toast.error(displayError);
                setError(displayError);
            } else {
                // Handle a success response
                const successMsg = `Processing complete! ${result.processedRows} rows were successfully saved.`;
                toast.success(successMsg);
                setSuccessMessage(successMsg);
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
                <Button component="label" variant="outlined" startIcon={<UploadFile />}>
                    {file ? file.name : 'Choose CSV File'}
                    <Input type="file" onChange={handleFileChange} sx={{ display: 'none' }} inputProps={{ accept: ".csv" }}/>
                </Button>

                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                {successMessage && <Alert severity="success" sx={{ mt: 2 }}>{successMessage}</Alert>}

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