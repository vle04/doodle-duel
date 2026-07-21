"use client";

import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  // get the current user from supabase on component mount
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // if no user, redirect to login page
        router.replace("/login"); // replace instead of push to prevent going back to dashboard
        return;
      }

      setEmail(user.email ?? "");
    }

    getUser();
  }, [router]);

  // handle logout with supabase
  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }
    
    // redirect to login page after logout
    router.push("/login");
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-2 bg-white text-black">
      <h1 className="text-2xl font-bold mb-4">Logged in!</h1>
      {/* if user exists, display welcome message */}
      <p className="text-lg mb-4">Welcome, {email}</p>
      <button onClick={handleLogout} className="bg-red-500 text-white rounded-md p-2 w-64">
        Logout
      </button>
    </main>
  );
}