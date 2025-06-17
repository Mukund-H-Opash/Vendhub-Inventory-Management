// app/page.jsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// This is a server component, so we can use async
export default async function Page() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect based on user's authentication state
  if (user) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }

  // This part will never be reached because of the redirects,
  // but a component must return something.
  return null;
}