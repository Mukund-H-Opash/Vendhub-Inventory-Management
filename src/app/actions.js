// src/app/actions.js
"use server";

import { createClient } from "@/lib/supabase/server";
import Papa from "papaparse";
import { getHeaderMapping, normalizeRow } from "@/lib/data/normalization";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Helper function to convert the file to text
async function fileToText(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return buffer.toString("utf-8");
}

export async function processCsvFile(formData) {
  const supabase = await createClient();
  const csvFile = formData.get("csvFile");

  if (!csvFile || csvFile.size === 0) {
    return { error: "No file provided." };
  }

  const fileText = await fileToText(csvFile);

  const parseResult = Papa.parse(fileText, {
    header: true,
    skipEmptyLines: true,
  });
  if (parseResult.errors.length > 0) {
    console.error("CSV Parsing Errors:", parseResult.errors);
    return { error: `CSV Parsing Error: ${parseResult.errors[0].message}` };
  }

  const headerMapping = getHeaderMapping(parseResult.meta.fields);
  if (!headerMapping.site_code || !headerMapping.upc) {
    return {
      error:
        "Could not identify required 'location' and 'product' columns in the CSV.",
    };
  }

  const normalizedData = parseResult.data
    .map((row) => normalizeRow(row, headerMapping))
    .filter(Boolean);

  if (normalizedData.length === 0) {
    return { error: "No valid data rows could be processed from the file." };
  }

  // Upsert the data.
  const { error } = await supabase.from("products").upsert(normalizedData);

  if (error) {
    console.error("Supabase upsert error:", error);
    return {
      error: "Failed to save data to the database.",
      details: error.message,
    };
  }

  console.log(
    `--- Finished: Successfully processed ${normalizedData.length} rows. ---`
  );
  return { processedRows: normalizedData.length };
}

export async function updateSaleRecord(formData) {
  const supabase = await createClient();

  // Extract data from formData
  const id = formData.get("id");
  const sale_date = formData.get("sale_date");
  const unit_price = parseFloat(formData.get("unit_price"));
  const final_total = parseFloat(formData.get("final_total"));

  if (!id) {
    return { error: "Record ID is missing." };
  }

  const { error } = await supabase
    .from("products")
    .update({
      sale_date,
      unit_price,
      final_total,
    })
    .eq("id", id);

  if (error) {
    console.error("Supabase update error:", error);
    return { error: "Failed to update record.", details: error.message };
  }

  revalidatePath(`/dashboard/locations/.*`);
  return { success: true };
}

export async function deleteSaleRecord(id) {
  const supabase = await createClient();

  if (!id) {
    return { error: "Record ID is missing." };
  }

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    console.error("Supabase delete error:", error);
    return { error: "Failed to delete record.", details: error.message };
  }

  revalidatePath(`/dashboard/locations/.*`);
  return { success: true };
}

// Updated server action for user sign-in
export async function signInUser(formData) {
  "use server";
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString().trim();
  const supabase = await createClient();

  if (!email || !password) {
    return { error: "Email and password fields cannot be empty." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { error: "Incorrect email or password. Please try again." };
    } else if (error.message.includes("Email not confirmed")) {
      return {
        error:
          "Your email is not verified. Please check your inbox for a verification link.",
      };
    } else {
      return { error: error.message };
    }
  }

  // Revalidate path to reflect authentication status change
  revalidatePath("/dashboard", "layout");
  return { success: true }; // Return success, let client handle redirect
}

// New server action for user sign-up
export async function signUpUser(formData) {
  "use server";
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString().trim();
  const supabase = await createClient();

  if (!email || !password) {
    return { error: "Email and password fields cannot be empty." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("User already registered")) {
      return { error: "An account with this email already exists." };
    } else {
      return { error: error.message };
    }
  }

  // No redirect here, client will handle toast and navigation
  return { success: true };
}
