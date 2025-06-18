// src/lib/data/normalization.js
import { parse, isValid } from 'date-fns';

const MAPPINGS = {
  site_code: ['location_id', 'site_code', 'machine name', 'location'],
  upc: ['scancode', 'upc', 'productid'],
  product_name: ['product_name', 'item_description', 'product'],
  sale_date: ['trans_date', 'sale_date', 'date'],
  unit_price: ['price', 'unit_price'],
  final_total: ['total_amount', 'final_total']
};

function getHeaderMapping(headers) {
  const mapping = {};
  const lowerCaseHeaders = headers.map(h => h.toLowerCase().replace(/ /g, '_'));

  for (const standardField in MAPPINGS) {
    for (const keyword of MAPPINGS[standardField]) {
      const foundIndex = lowerCaseHeaders.findIndex(h => h.includes(keyword));
      if (foundIndex !== -1) {
        mapping[standardField] = headers[foundIndex];
        break;
      }
    }
  }
  return mapping;
}

function parseFlexibleDate(dateString) {
    if (!dateString) return null;
    const formats = ['yyyy-MM-dd', 'MM/dd/yyyy'];
    for (const format of formats) {
        const parsedDate = parse(dateString, format, new Date());
        if (isValid(parsedDate)) return parsedDate;
    }
    return null;
}

function normalizeRow(row, headerMapping) {
    try {
        const site_code = row[headerMapping.site_code]; // <-- Use the site_code directly
        const upc = row[headerMapping.upc];
        
        if (!site_code || !upc) return null;

        // --- THE FIX IS HERE ---
        // We no longer modify the site_code with .replace()
        // This ensures codes like '2.0_KIT_03' are preserved correctly.

        const product_name = row[headerMapping.product_name] || null;
        const sale_date = parseFlexibleDate(row[headerMapping.sale_date]);
        const unit_price = parseFloat(row[headerMapping.unit_price]) || 0;
        const final_total = parseFloat(row[headerMapping.final_total]) || 0;

        return { site_code, upc, product_name, sale_date, unit_price, final_total };
    } catch (error) {
        console.error("Error in normalizeRow:", error);
        return null;
    }
}

export { getHeaderMapping, normalizeRow };