// src/components/dashboard/UploadForm.jsx
"use client";

import { useState } from 'react';
import { Button, Input, Box, CircularProgress, Alert, Typography, Paper, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { UploadFile, CheckCircleOutline, ErrorOutline, WarningAmber } from '@mui/icons-material';
import { processCsvFile } from '@/app/actions'; 
import toast from 'react-hot-toast';

export default function UploadForm() {
    const [isSubmitting, setSubmitting] = useState(false);
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null); // State to hold the processing results

    const handleFileChange = (event) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setResult(null); // Clear previous results when a new file is chosen
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!file) {
            toast.error('Please select a file to upload.');
            return;
        }

        setSubmitting(true);
        setResult(null);

        const formData = new FormData();
        formData.append('csvFile', file);

        try {
            const processResult = await processCsvFile(formData);
            setResult(processResult); // Save the entire result object

            if (processResult.updatedRows > 0 && processResult.errors?.length === 0) {
                toast.success('Processing complete!');
            } else if (processResult.updatedRows > 0 && processResult.errors?.length > 0) {
                toast.warning('Processing complete with some errors.');
            } else if (processResult.error) {
                toast.error(`Processing failed: ${processResult.error}`);
            } else if (processResult.errors?.length > 0) {
                 toast.error(`Processing failed. See errors below.`);
            } else if (processResult.updatedRows === 0 && processResult.skippedRows > 0) {
                 toast.warning(`Processing complete, but no rows were updated.`);
            }

        } catch (e) {
            const errorMessage = 'An unexpected error occurred.';
            toast.error(errorMessage);
            setResult({ errors: [errorMessage] });
            console.error(e);
        }

        setSubmitting(false);
        event.target.reset(); 
    };

    return (
      <>
        <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button component="label" variant="outlined" startIcon={<UploadFile />}>
                    {file ? file.name : 'Choose CSV File'}
                    <Input type="file" onChange={handleFileChange} sx={{ display: 'none' }} inputProps={{ accept: ".csv" }}/>
                </Button>
                
                <Button type="submit" variant="contained" disabled={isSubmitting || !file}>
                    {isSubmitting ? <CircularProgress size={24} /> : 'Process Sales Data'}
                </Button>
            </Box>
        </form>

        {/* --- NEW: Results Display Section --- */}
        {result && (
            <Paper variant="outlined" sx={{ mt: 4, p: 2, backgroundColor: 'background.default' }}>
                <Typography variant="h6" gutterBottom>Processing Report</Typography>
                <List dense>
                    <ListItem>
                        <ListItemIcon><CheckCircleOutline color="success" /></ListItemIcon>
                        <ListItemText primary="Rows Updated Successfully" secondary={result.updatedRows || 0} />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><WarningAmber color="warning" /></ListItemIcon>
                        <ListItemText primary="Rows Skipped" secondary={result.skippedRows || 0} />
                    </ListItem>
                </List>
                {(result.errors?.length > 0 || result.error) && (
                     <Alert severity="error" sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>Errors:</Typography>
                         <List dense>
                            {result.error && <ListItem><ListItemIcon><ErrorOutline fontSize="small"/></ListItemIcon><ListItemText primary={result.error}/></ListItem>}
                            {result.errors?.map((err, index) => (
                                <ListItem key={index}>
                                    <ListItemIcon><ErrorOutline fontSize="small"/></ListItemIcon>
                                    <ListItemText primary={err} />
                                </ListItem>
                            ))}
                        </List>
                    </Alert>
                )}
            </Paper>
        )}
      </>
    );
}