// src/middleware.js
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  // This response object is used to set cookies on the outgoing response.
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Initialize the Supabase client with the modern, simplified cookie methods.
  const supabase = createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      cookies: {
        async getAll() {
          return await request.cookies.getAll();
        },
        // The `setAll` method is used to set cookies on both the request and response.
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh the user's session token on every request.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // If a logged-in user tries to access the login or signup page, redirect them to the dashboard.
  if (session && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If a user is not logged in and tries to access a protected route, redirect them to the login page.
  if (!session && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
