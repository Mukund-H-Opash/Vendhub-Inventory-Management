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
    // FIX: Added 'await' to correctly initialize the Supabase client.
    const supabase = await createClient();
    const csvFile = formData.get('csvFile');

    if (!csvFile || csvFile.size === 0) {
        return { error: "No file provided." };
    }

    const fileText = await fileToText(csvFile);

    // 1. Parse the CSV data from the file content
    const parseResult = Papa.parse(fileText, { header: true, skipEmptyLines: true });
    if (parseResult.errors.length > 0) {
        console.error("CSV Parsing Errors:", parseResult.errors);
        return { error: `CSV Parsing Error: ${parseResult.errors[0].message}` };
    }

    // 2. Normalize the parsed data
    const headerMapping = getHeaderMapping(parseResult.meta.fields);
    if (!headerMapping.site_code || !headerMapping.upc) {
        return { error: "Could not identify required 'location' and 'product' columns in the CSV." };
    }
    
    const normalizedData = parseResult.data
      .map(row => normalizeRow(row, headerMapping))
      .filter(Boolean); // Filter out any null rows from normalization errors

    if (normalizedData.length === 0) {
        return { error: "No valid data rows could be processed from the file." };
    }

    // 3. Upsert the data into the 'products' table.
    // .upsert() will insert new rows or update existing ones based on your table's primary key.
    // Make sure your 'products' table has a primary key (e.g., on 'upc' and 'site_code').
    const { count, error } = await supabase
        .from('products')
        .upsert(normalizedData);

    if (error) {
        console.error("Supabase upsert error:", error);
        return { error: "Failed to save data to the database.", details: error.message };
    }

    // 4. Return the success result with the number of rows processed.
    console.log(`--- Finished: Successfully processed ${count || 0} rows. ---`);
    return { processedRows: count || 0 };
}