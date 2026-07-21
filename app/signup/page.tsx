"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // handle signup with supabase
  async function handleSignup() {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const user = data.user;

    if (!user) {
      alert("Failed to create user.");
      return;
    }

    // create profile in prisma
    await fetch("/api/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: user.id,
        email: user.email,
      }),
    });

    setMessage("Account created! Please check your email to confirm your account.");
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-2 bg-white text-black">
      <h1 className="text-2xl font-bold mb-4">Sign Up to Play</h1>
      {message && <p className="text-green-500 mb-4">{message}</p>}
      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        className="border border-gray-300 rounded-md p-2 mb-4 w-64"
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
        className="border border-gray-300 rounded-md p-2 mb-4 w-64"
      />
      <button onClick={handleSignup} className="bg-blue-500 text-white rounded-md p-2 w-64">
        Sign Up
      </button>

      <a href="/login" className="text-blue-500 hover:underline mt-4">
        Already have an account? Login
      </a>
    </main>
  );
}