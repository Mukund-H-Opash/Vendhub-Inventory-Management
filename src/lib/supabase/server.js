// src/lib/supabase/server.js
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        async getAll() {
          return (await cookieStore).getAll();
        },
        async setAll(cookiesToSet) {
          try {
            const resolvedCookiesStore = await cookieStorecookiesToSet.forEach(
              ({ name, value, options }) =>
                resolvedCookiesStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}
