// src/actions.js
"use server";

import { createClient } from '@/lib/supabase/server';
import Papa from 'papaparse';
import { detectFormat, normalizeRow, aggregateSales } from '@/lib/data/normalization';

// Helper function to read the file content as text
async function fileToText(file) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    return buffer.toString('utf-8');
}

export async function processCsvFile(formData) {
    const supabase = createClient();
    const csvFile = formData.get('csvFile');

    if (!csvFile || csvFile.size === 0) {
        return { error: "No file provided or file is empty." };
    }

    const fileText = await fileToText(csvFile);

    // 1. PARSE THE CSV
    const parseResult = Papa.parse(fileText, {
        header: true,
        skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
        return { error: `CSV Parsing Error: ${parseResult.errors[0].message}` };
    }
    if (parseResult.data.length === 0) {
        return { error: "CSV contains no data." };
    }

    // 2. DETECT FORMAT AND NORMALIZE DATA
    const headers = parseResult.meta.fields;
    const format = detectFormat(headers);

    if (format === 'UNKNOWN') {
        return { error: "Could not determine CSV format. Please check the file headers." };
    }

    const normalizedData = parseResult.data.map(row => normalizeRow(row, format));

    // 3. AGGREGATE SALES TO REDUCE DATABASE QUERIES
    const salesMap = aggregateSales(normalizedData);
    if (salesMap.size === 0) {
        return { error: "No valid sales data found to process." };
    }

    // 4. UPDATE DATABASE RECORDS
    let updatedRows = 0;
    let errors = [];

    // Begin transaction
    for (const [key, quantitySold] of salesMap.entries()) {
        const [site_code, upc] = key.split('|');

        // Use an RPC function for the inventory update to handle the logic within the database.
        // This is more efficient and secure.
        const { error } = await supabase.rpc('update_inventory_from_sale', {
            p_site_code: site_code,
            p_upc: upc,
            p_quantity_sold: quantitySold
        });

        if (error) {
            console.error(`DB Error for ${key}:`, error.message);
            errors.push(`Failed to update inventory for UPC ${upc} at location ${site_code}.`);
        } else {
            updatedRows++;
        }
    }

    if (errors.length > 0) {
        // Return a partial success message if some rows were updated
        const errorMessage = updatedRows > 0 
            ? `Completed with ${errors.length} errors. ${errors[0]}`
            : `Processing failed. ${errors[0]}`;
        return { error: errorMessage, updatedRows };
    }

    return { updatedRows };
}