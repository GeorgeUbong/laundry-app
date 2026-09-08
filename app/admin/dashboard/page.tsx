// Dashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { getStats } from "@/apis/adminRoutes";
import Loading from "./loading";

type DashboardStats = {
  categories: number;
  customers: number;
  income: number;
  orders: number;
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    categories: 0,
    customers: 0,
    income: 0,
    orders: 0,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        // Get admin JWT token from localStorage
        const adminToken = localStorage.getItem("token2");

        if (!adminToken) {
          setError("Your session has expired. Please log in again.");
          return;
        }

        // Get dashboard statistics
        const statsData = await getStats(adminToken);
        
        setStats(statsData.dashboardData);
      } catch (err) {
        console.error("Failed to load dashboard:", err);

        const errorMessage = err instanceof Error ? err.message : "Failed to load dashboard";
        
        // Check if it's an auth error
        if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
          setError("Invalid or expired token. Please log in again.");
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // ... rest of component


  // Loading state
  if (loading) {
    return (
      <main>
        <Loading />
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen bg-black p-6 text-white">
        <p className="text-red-500">{error}</p>
      </main>
    );
  }

  return (
    <main className="page-enter min-h-screen bg-black p-6 text-white">
      {/* Header */}
      <h1 className="mb-2 text-3xl font-bold">
        Dashboard
      </h1>

      <h3 className="mb-8 text-xl text-gray-300">
        Hello laundro como 👋
      </h3>

      {/* ================= STATS ================= */}
      <div className="stagger-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* Customers */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <p className="text-sm text-gray-400">
            Customers
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {stats.customers}
          </h2>
        </div>

        {/* Orders */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <p className="text-sm text-gray-400">
            Orders
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {stats.orders}
          </h2>
        </div>

        {/* Categories */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <p className="text-sm text-gray-400">
            Categories
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {stats.categories}
          </h2>
        </div>

        {/* Income */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <p className="text-sm text-gray-400">
            Income
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            ₦{stats.income.toLocaleString()}
          </h2>
        </div>

      </div>
    </main>
  );
}