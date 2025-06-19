// src/app/actions.js
"use server";

import { createClient } from '@/lib/supabase/server';
import Papa from 'papaparse';
import { getHeaderMapping, normalizeRow } from '@/lib/data/normalization';

// Helper function to convert the file to text
async function fileToText(file) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    return buffer.toString('utf-8');
}

export async function processCsvFile(formData) {
    const supabase = await createClient();
    const csvFile = formData.get('csvFile');

    if (!csvFile || csvFile.size === 0) {
        return { error: "No file provided." };
    }

    const fileText = await fileToText(csvFile);

    const parseResult = Papa.parse(fileText, { header: true, skipEmptyLines: true });
    if (parseResult.errors.length > 0) {
        console.error("CSV Parsing Errors:", parseResult.errors);
        return { error: `CSV Parsing Error: ${parseResult.errors[0].message}` };
    }

    const headerMapping = getHeaderMapping(parseResult.meta.fields);
    if (!headerMapping.site_code || !headerMapping.upc) {
        return { error: "Could not identify required 'location' and 'product' columns in the CSV." };
    }
    
    const normalizedData = parseResult.data
      .map(row => normalizeRow(row, headerMapping))
      .filter(Boolean);

    if (normalizedData.length === 0) {
        return { error: "No valid data rows could be processed from the file." };
    }

    // Upsert the data.
    const { error } = await supabase
        .from('products')
        .upsert(normalizedData);

    if (error) {
        console.error("Supabase upsert error:", error);
        return { error: "Failed to save data to the database.", details: error.message };
    }

    console.log(`--- Finished: Successfully processed ${normalizedData.length} rows. ---`);
    return { processedRows: normalizedData.length };
}