"use server";

import { createClient } from '@/lib/supabase/server';
import Papa from 'papaparse';
import { getHeaderMapping, normalizeRow } from '@/lib/data/normalization';

async function fileToText(file) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    return buffer.toString('utf-8');
}

export async function processCsvFile(formData) {
    const supabase = createClient();
    const csvFile = formData.get('csvFile');

    if (!csvFile || csvFile.size === 0) {
        return { error: "No file provided." };
    }

    const fileText = await fileToText(csvFile);

    // 1. Parse the CSV
    const parseResult = Papa.parse(fileText, { header: true, skipEmptyLines: true });
    if (parseResult.errors.length > 0) {
        return { error: `CSV Parsing Error: ${parseResult.errors[0].message}` };
    }

    // 2. Normalize the data
    const headerMapping = getHeaderMapping(parseResult.meta.fields);
    if (!headerMapping.site_code || !headerMapping.upc) {
        return { error: "Could not identify required 'location' and 'product' columns." };
    }
    const normalizedData = parseResult.data.map(row => normalizeRow(row, headerMapping)).filter(Boolean);

    if (normalizedData.length === 0) {
        return { error: "No valid data rows found to process." };
    }

    // 3. Insert the clean, normalized data into the 'products' table
    const { error, count } = await supabase.from('products').insert(normalizedData);

    if (error) {
        console.error("Supabase insert error:", error);
        return { error: "Failed to save data to the database.", details: error.message };
    }

    // 4. Return the final success result with the number of rows processed
    console.log(`--- Finished: Successfully inserted ${count || 0} rows. ---`);
    return { processedRows: count || 0 };
}