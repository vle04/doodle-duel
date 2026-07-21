"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // handle login with supabase
  async function handleLogin() {
    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      alert(error.message);
      return;
    }

    // redirect to dashboard after successful login
    router.push("/dashboard");
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-2 bg-white text-black">
      <h1 className="text-2xl font-bold mb-4">Login to Play</h1>
      <input 
        onChange={(e) => setEmail(e.target.value)} 
        placeholder="Email"
        className="border border-gray-300 rounded-md p-2 mb-4 w-64"
      />
      <input
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="border border-gray-300 rounded-md p-2 mb-4 w-64"
      />

      <button onClick={handleLogin} className="bg-blue-500 text-white rounded-md p-2 w-64">
        Login
      </button>

      <a href="/signup" className="text-blue-500 hover:underline mt-4">
        Don't have an account? Sign up
      </a>
    </main>
  );
}