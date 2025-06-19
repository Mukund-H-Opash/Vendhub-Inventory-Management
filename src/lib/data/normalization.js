// src/lib/data/normalization.js
import { parse, isValid } from "date-fns";

const MAPPINGS = {
  site_code: ["location_id", "site_code", "location"],
  upc: ["scancode", "upc", "productid"],
  product_name: ["product_name", "item_description", "product"],
  sale_date: ["trans_date", "sale_date", "date"],
  unit_price: ["price", "unit_price"],
  final_total: ["total_amount", "final_total"],
};


function isDateStringValid(dateString) {
  if (!dateString) return false;

  const yyyy_mm_dd = /^\d{4}-\d{2}-\d{2}$/;
  const mm_dd_yyyy = /^\d{2}\/\d{2}\/\d{4}$/;

  if (yyyy_mm_dd.test(dateString)) {
    const [_, month, day] = dateString.split("-").map(Number);
    if (month < 1 || month > 12 || day < 1 || day > 31) return false;
    return true;
  }

  if (mm_dd_yyyy.test(dateString)) {
    const [month, day, _] = dateString.split("/").map(Number);
    if (month < 1 || month > 12 || day < 1 || day > 31) return false;
    return true;
  }

  return false;
}

function parseFlexibleDate(dateString) {
  if (!dateString || !isDateStringValid(dateString.trim())) {
    return null; 
  }
  const formats = ["yyyy-MM-dd", "MM/dd/yyyy"];
  for (const format of formats) {
    const parsedDate = parse(dateString.trim(), format, new Date());
    if (isValid(parsedDate)) {
     
      const [year, month, day] = dateString.includes("-")
        ? dateString.split("-")
        : dateString.split("/");

      const parsedMonth = parsedDate.getMonth() + 1;
      const parsedDay = parsedDate.getDate();

  
      if (dateString.includes("/")) {
        if (
          parseInt(month, 10) === parsedMonth &&
          parseInt(day, 10) === parsedDay
        ) {
          return parsedDate;
        }
      } else {

        if (
          parseInt(month, 10) === parsedMonth &&
          parseInt(day, 10) === parsedDay
        ) {
          return parsedDate;
        }
      }
    }
  }
  return null; 
}

function parseValidAmount(amountString) {
  if (typeof amountString !== "string" && typeof amountString !== "number") {
    return { error: "Invalid type", value: null };
  }

  const cleanedString = String(amountString).trim();
  if (cleanedString === "") {
    return { error: "Empty string", value: null };
  }

  const value = parseFloat(cleanedString);

  if (isNaN(value)) {
    return { error: "Not a number", value: null };
  }

  if (value < 0) {
    return { error: "Negative amount not allowed", value: null };
  }

  if (cleanedString.includes(".") && cleanedString.split(".")[1].length > 3) {
    return { error: "Excessive decimal precision", value: null };
  }

  if (value === 0) {
      return { error: 'Zero amount not allowed', value: null };
  }

  return { error: null, value: value };
}

function getHeaderMapping(headers) {
  const mapping = {};
  const lowerCaseHeaders = headers.map((h) =>
    String(h || "")
      .toLowerCase()
      .replace(/ /g, "_")
  );

  for (const standardField in MAPPINGS) {
    for (const keyword of MAPPINGS[standardField]) {
      const foundIndex = lowerCaseHeaders.findIndex((h) => h.includes(keyword));
      if (foundIndex !== -1) {
        mapping[standardField] = headers[foundIndex];
        break;
      }
    }
  }
  return mapping;
}

function normalizeRow(row, headerMapping) {
  const errors = [];

  const site_code_key = headerMapping.site_code;
  const upc_key = headerMapping.upc;

  if (!site_code_key || !row[site_code_key]) {
    errors.push("Missing or empty mandatory field: site_code");
  }

  if (!upc_key || !row[upc_key]) {
    errors.push("Missing or empty mandatory field: upc");
  }

  if (!row[headerMapping.sale_date]) {
    errors.push("Missing or empty mandatory field: sale_date");
  }

  if (!row[headerMapping.unit_price]) {
    errors.push("Missing or empty mandatory field: unit_price");
  }

  if (!row[headerMapping.final_total]) {
    errors.push("Missing or empty mandatory field: final_total");
  }

  if (errors.length > 0) {
    console.error(`Row rejected: ${errors.join(", ")}`, { row });
    return null;
  }
  
  const site_code = String(row[site_code_key]).trim();
  const upc = String(row[upc_key]).trim();

  const product_name = row[headerMapping.product_name]
    ? String(row[headerMapping.product_name]).trim()
    : null;

  const sale_date_string = row[headerMapping.sale_date];
  const sale_date = parseFlexibleDate(sale_date_string);
  if (!sale_date && sale_date_string) {
    errors.push(`Invalid sale_date format: "${sale_date_string}"`);
  }

  const priceResult = parseValidAmount(row[headerMapping.unit_price]);
  if (priceResult.error) {
    errors.push(`Invalid unit_price: ${priceResult.error}`);
  }
  const totalResult = parseValidAmount(row[headerMapping.final_total]);
  if (totalResult.error) {
    errors.push(`Invalid final_total: ${totalResult.error}`);
  }

  if (errors.length > 0) {
    console.error(
      `Row rejected due to validation errors: ${errors.join(", ")}`,
      { row }
    );
    return null;
  }

  return {
    site_code,
    upc,
    product_name,
    sale_date,
    unit_price: priceResult.value,
    final_total: totalResult.value,
  };
}

export { getHeaderMapping, normalizeRow };
