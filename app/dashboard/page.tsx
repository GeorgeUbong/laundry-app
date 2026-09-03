"use client";

import { useEffect, useState } from "react";
import { getStats } from "@/apis/userRoutes";
import { StatsDataResponse } from "@/apis/userRoutes";

export default function Dashboard() {
  const [stats, setStats] = useState<StatsDataResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError("");

        // Get JWT token from localStorage
        const token = localStorage.getItem("token");

        if (!token) {
          setError("You are not authenticated");
          return;
        }

        // Call API with token
        const data = await getStats(token);

        setStats(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <main className="bg-black min-h-screen text-white">
        <p>Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="bg-black min-h-screen text-white">
        <p className="text-red-500">{error}</p>
      </main>
    );
  }

  return (
    <main className="bg-black min-h-screen text-white">
      <h3>Hello frens</h3>

      <p>
        Customers: {stats?.customers ?? 0}
      </p>

      <p>
        Orders: {stats?.orders ?? 0}
      </p>

      <p>
        Categories: {stats?.categories ?? 0}
      </p>
    </main>
  );
}