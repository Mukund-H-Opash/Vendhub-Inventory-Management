// src/app/actions.js
"use server";

import { createClient } from '@/lib/supabase/server';
import Papa from 'papaparse';
import { detectFormat, normalizeRow, aggregateSales } from '@/lib/data/normalization';

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

    const parseResult = Papa.parse(fileText, { header: true, skipEmptyLines: true });
    if (parseResult.errors.length > 0) return { error: `CSV Parsing Error: ${parseResult.errors[0].message}` };

    const format = detectFormat(parseResult.meta.fields);
    if (format === 'UNKNOWN') return { error: "Could not determine CSV format." };

    const normalizedData = parseResult.data.map(row => normalizeRow(row, format));
    const salesMap = aggregateSales(normalizedData);
    if (salesMap.size === 0) return { error: "No valid sales data found to process." };

    // --- NEW: Detailed Feedback and Edge Case Handling ---
    let updatedRows = 0;
    let skippedRows = 0;
    let errors = [];

    for (const [key, quantitySold] of salesMap.entries()) {
        const [site_code, upc] = key.split('|');
        
        // Edge Case 1: Check if the location exists
        const { data: location } = await supabase.from('locations').select('id').eq('site_code', site_code).single();
        if (!location) {
            errors.push(`Location with Site Code '${site_code}' not found.`);
            skippedRows++;
            continue; // Skip to the next item
        }

        // Edge Case 2: Check if the product exists
        const { data: product } = await supabase.from('products').select('id').eq('upc', upc).single();
        if (!product) {
            errors.push(`Product with UPC '${upc}' not found.`);
            skippedRows++;
            continue; // Skip to the next item
        }

        // Edge Case 3: Check if the inventory record exists (product is assigned to location)
        const { data: inventoryItem, error: inventoryError } = await supabase
            .from('inventory')
            .select('id, stock_level')
            .eq('location_id', location.id)
            .eq('product_id', product.id)
            .single();

        if (!inventoryItem) {
            errors.push(`Product '${upc}' is not in the inventory of location '${site_code}'.`);
            skippedRows++;
            continue;
        }

        // If all checks pass, update the stock level
        const newStock = Math.max(0, inventoryItem.stock_level - quantitySold);
        const { error: updateError } = await supabase
            .from('inventory')
            .update({ stock_level: newStock })
            .eq('id', inventoryItem.id);

        if (updateError) {
            errors.push(`DB error for ${site_code}|${upc}: ${updateError.message}`);
            skippedRows++;
        } else {
            updatedRows++;
        }
    }
    
    // Return a detailed report object
    return { updatedRows, skippedRows, errors };
}