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

  // handle create room
  async function handleCreateRoom() {
    const { data: { user } } = await supabase.auth.getUser();
    
    // call the API route to create a room
    const res = await fetch("/api/rooms", {
      method: "POST",
      body: JSON.stringify({
        hostId: user?.id,
      }),
    });

    if (!res.ok) {
      alert("Failed to create room");
      return;
    }

    const room = await res.json();

    router.push(`/room/${room.code}`);
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-2 bg-white text-black">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {/* if user exists, display welcome message */}
      <p className="text-lg mb-4">Welcome, {email}</p>

      {/* create or join room */}
      <div className="flex flex-col items-center mb-4">
        <button className="bg-blue-500 text-white rounded-md p-2 w-64 mb-4" onClick={handleCreateRoom}>
          Create Room
        </button>
        <p className="text-lg">OR</p>
        <div className="flex flex-col items-center mt-4">
          <input placeholder="Room Code" className="border border-gray-300 rounded-md p-2 mb-4 w-64" />
          <button className="bg-green-500 text-white rounded-md p-2 w-64">Join Room</button>
        </div>
      </div>

      <button onClick={handleLogout} className="bg-red-500 text-white rounded-md p-2 w-64">
        Logout
      </button>
    </main>
  );
}