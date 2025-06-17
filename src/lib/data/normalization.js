// src/lib/data/normalization.js

// Define the expected headers for each format to help with detection.
const FORMAT_A_HEADERS = ['Location_ID', 'Scancode'];
const FORMAT_B_HEADERS = ['Site_Code', 'UPC'];

/**
 * Detects the CSV format based on its header columns.
 * @param {string[]} headers - An array of header columns from the CSV.
 * @returns {'A' | 'B' | 'UNKNOWN'} - The detected format.
 */
function detectFormat(headers) {
    const hasFormatAHeaders = FORMAT_A_HEADERS.every(h => headers.includes(h));
    if (hasFormatAHeaders) return 'A';

    const hasFormatBHeaders = FORMAT_B_HEADERS.every(h => headers.includes(h));
    if (hasFormatBHeaders) return 'B';

    return 'UNKNOWN';
}

/**
 * Normalizes a single row of data into a unified schema.
 * @param {object} row - A single row object from the parsed CSV.
 * @param {'A' | 'B'} format - The format of the source CSV.
 * @returns {{site_code: string, upc: string, quantitySold: number} | null}
 */
function normalizeRow(row, format) {
    let site_code, upc, quantitySold;

    try {
        if (format === 'A') {
            // Format A: "iOS Vending Systems"
            // Assuming sales data implies quantity of 1 for each transaction row.
            site_code = row.Location_ID;
            upc = row.Scancode;
            quantitySold = 1; 
        } else if (format === 'B') {
            // Format B: "Cantaloupe Systems"
            // Assuming sales data implies quantity of 1 for each transaction row.
            site_code = row.Site_Code;
            upc = row.UPC;
            quantitySold = 1;
        } else {
            return null;
        }

        // Basic validation
        if (!site_code || !upc || isNaN(quantitySold) || quantitySold <= 0) {
            return null;
        }

        // Handle the specific format difference in site codes (e.g., '2.0_SW_02' vs 'SW_02')
        const normalized_site_code = site_code.replace(/^2\.0_/, '');

        return { site_code: normalized_site_code, upc, quantitySold };
    } catch (error) {
        console.error("Error normalizing row:", row, error);
        return null;
    }
}

/**
 * Aggregates sales data from normalized rows.
 * @param {object[]} normalizedData - An array of normalized data objects.
 * @returns {Map<string, number>} - A map where the key is 'site_code|upc' and the value is total quantity sold.
 */
function aggregateSales(normalizedData) {
    const salesMap = new Map();

    for (const item of normalizedData) {
        if (!item) continue;
        const key = `<span class="math-inline">\{item\.site\_code\}\|</span>{item.upc}`;
        const currentSales = salesMap.get(key) || 0;
        salesMap.set(key, currentSales + item.quantitySold);
    }

    return salesMap;
}


export { detectFormat, normalizeRow, aggregateSales };