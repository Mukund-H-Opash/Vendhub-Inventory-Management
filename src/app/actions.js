"use server";

import { createClient } from '@/lib/supabase/server';
import Papa from 'papaparse';
import { getHeaderMapping, normalizeRow } from '@/lib/data/normalization'; // Assuming this file exists and is correct

async function fileToText(file) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    return buffer.toString('utf-8');
}

export async function processCsvFile(formData) {
    const supabase = createClient();
    const csvFile = formData.get('csvFile');
    if (!csvFile) return { error: "No file provided." };

    const fileText = await fileToText(csvFile);
    const parseResult = Papa.parse(fileText, { header: true, skipEmptyLines: true });
    
    const headerMapping = getHeaderMapping(parseResult.meta.fields);
    if (!headerMapping.upc) {
        return { error: "Could not identify a UPC/Scancode column." };
    }
    
    const normalizedData = parseResult.data.map(row => normalizeRow(row, headerMapping)).filter(Boolean);
    if (normalizedData.length === 0) {
        return { error: "No valid data rows found to process." };
    }

    // --- NEW DUPLICATE HANDLING LOGIC ---

    // 1. Get all UPCs from the incoming CSV
    const csvUpcs = new Set(normalizedData.map(row => row.upc));

    // 2. Find which of those UPCs already exist in the database
    const { data: existingProducts, error: fetchError } = await supabase
        .from('products')
        .select('upc')
        .in('upc', Array.from(csvUpcs));

    if (fetchError) {
        console.error("Error fetching existing UPCs:", fetchError);
        return { error: "Could not verify existing products in the database." };
    }

    const existingUpcs = new Set(existingProducts.map(p => p.upc));

    // 3. Filter out the duplicates to get only the new records
    const newRecords = normalizedData.filter(row => !existingUpcs.has(row.upc));
    const duplicateUpcs = Array.from(csvUpcs).filter(upc => existingUpcs.has(upc));

    // 4. Check if there are any new records to insert
    if (newRecords.length === 0) {
        let errorMessage = "No new products to add.";
        if (duplicateUpcs.length > 0) {
            errorMessage = `All ${duplicateUpcs.length} products in the CSV already exist in the database. Duplicate UPCs: ${duplicateUpcs.join(', ')}.`;
        }
        return { error: errorMessage, duplicates: duplicateUpcs, processedRows: 0 };
    }

    // 5. Insert only the new, unique records
    const { error: insertError, count } = await supabase.from('products').insert(newRecords);

    if (insertError) {
        console.error("Supabase insert error:", insertError);
        return { error: "Failed to save new data to the database." };
    }
    
    // 6. Report success along with any duplicates that were skipped
    let message = `Successfully saved ${count || 0} new products.`;
    if (duplicateUpcs.length > 0) {
        message += ` Skipped ${duplicateUpcs.length} duplicate products.`;
    }

    return { successMessage: message, processedRows: count || 0, duplicates: duplicateUpcs };
}