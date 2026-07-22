// for now, single browser client is enough to get signup and login working
// we can add a server client later for server components, route handlers, middleware, etc. if we need it

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // No-op in API routes unless you need to refresh cookies
        },
      },
    }
  );
}