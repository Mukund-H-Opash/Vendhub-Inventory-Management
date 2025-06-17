// src/app/(dashboard)/page.jsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = createClient();

  // 1. Check for an active user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. If the user is not logged in, redirect to the login page
  if (!user) {
    redirect('/login');
  }

  // 3. Define the logout function as a Server Action right here
  const signOut = async () => {
    'use server'; // This is a server action!

    const supabase = createClient();
    await supabase.auth.signOut();
    return redirect('/login');
  };

  // 4. Render the entire page with UI and the logout form
  return (
    <div>
      <header style={{ background: '#eee', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Vending Dashboard</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>{user.email}</span>
          {/* A form is used to call the server action */}
          <form action={signOut}>
            <button type="submit">Logout</button>
          </form>
        </div>
      </header>
      
      <main style={{ padding: '1rem' }}>
        <h1>Location Overview</h1>
        <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc' }}>
            <p>A list of all vending machine locations will be displayed here soon.</p>
        </div>
      </main>
    </div>
  );
}