"use client";

import { useEffect, useState } from "react";
import {
  getStats,
  Order,
  getRecentOrders
} from "@/apis/userRoutes";
import { Button } from "@/_components/button";
import { Card } from "@/_components/card";
import Loading from "./loading";

type DashboardStats = {
  categories: number;
  customers: number;
  income: number;
  orders: number;
};

export default function OrdersPage() {
  const [stats, setStats] = useState<DashboardStats>({
    categories: 0,
    customers: 0,
    income: 0,
    orders: 0,
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      // Get JWT token from localStorage
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Your session has expired");
        return;
      }

      // Get stats, customers, and orders at the same time
      const [statsData, ordersData] = await Promise.all([
        getStats(token),
        getRecentOrders(token),
      ]);

      console.log("Stats received:", statsData);
      console.log("Orders received:", ordersData);

      // Store dashboard statistics
      setStats(statsData.dashboardData);

      // Store orders
      setOrders(ordersData.orders);
    } catch (err) {
      console.error("Failed to load dashboard:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  loadDashboard();
}, []);

  // Loading state
    if (loading) {
      return (
      <main>
        <Loading/>
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
    <main className="min-w-0 p-4 sm:p-6 lg:p-8">
         {/* Header */}
      <h1 className="mb-2 text-2xl font-bold sm:text-3xl">
        Orders
      </h1>

      <h3 className="mb-6 text-base text-gray-300 sm:text-xl">
        View and manage orders
      </h3>
     {/* ================= BUTTON ================= */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Button>Create Order</Button>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* Customers */}
        <Card className="p-4 sm:p-6">
          <p className="text-sm text-gray-400">
            Customers
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {stats.customers}
          </h2>
        </Card>

        {/* Orders */}
        <Card className="p-4 sm:p-6">
          <p className="text-sm text-gray-400">
            Orders
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {stats.orders}
          </h2>
        </Card>

        {/* Categories */}
        <Card className="p-4 sm:p-6">
          <p className="text-sm text-gray-400">
            Categories
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {stats.categories}
          </h2>
        </Card>

        {/* Income */}
        <Card className="p-4 sm:p-6">
          <p className="text-sm text-gray-400">
            Income
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            ₦{stats.income.toLocaleString()}
          </h2>
        </Card>
      </div>


      {/**TABLE */}
        <div className="mt-8 min-w-0 overflow-hidden rounded-xl border border-card-border bg-card-bg">

        <div className="overflow-x-auto">
          <table className="min-w-[48rem] w-full text-left text-sm">

            {/* ================= TABLE HEADER ================= */}

            <thead className="border-b border-gray-800 bg-gray-900">
              <tr>

                <th className="px-6 py-4 text-sm font-semibold text-gray-300">
                  Order
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-300">
                  Customer
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-300">
                  Phone
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-300">
                  Items
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-300">
                  Total
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-300">
                  Status
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-300">
                  Date
                </th>

              </tr>
            </thead>

            {/* ================= TABLE BODY ================= */}

            <tbody className="divide-y divide-gray-800">

              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (

                  <tr
                    key={order.id}
                    className="transition hover:bg-gray-900"
                  >

                    {/* Order ID */}
                    <td className="px-6 py-5">
                      <span className="font-semibold text-white">
                        #{order.id}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-5">
                      <span className="font-medium text-white">
                        {order.customer.username}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-5 text-gray-400">
                      {order.customer.phonenumber}
                    </td>

                    {/* Items */}
                    <td className="px-6 py-5">

                      <div className="space-y-1">

                        {order.items.map((orderItem) => (
                          <div
                            key={orderItem.id}
                            className="text-sm"
                          >
                            <span className="text-gray-200">
                              {orderItem.item.name}
                            </span>

                            <span className="ml-2 text-gray-500">
                              × {orderItem.quantity}
                            </span>
                          </div>
                        ))}

                      </div>

                    </td>

                    {/* Total */}
                    <td className="px-6 py-5">
                      <span className="font-semibold text-green-400">
                        ₦{order.totalAmount.toLocaleString()}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          order.status.toLowerCase() === "pending"
                            ? "bg-yellow-500/10 text-yellow-400"
                            : order.status.toLowerCase() === "completed"
                            ? "bg-green-500/10 text-green-400"
                            : "bg-gray-500/10 text-gray-400"
                        }`}
                      >
                        {order.status}
                      </span>

                    </td>

                    {/* Date */}
                    <td className="px-6 py-5 text-sm text-gray-400">
                      {new Date(
                        order.createdAt
                      ).toLocaleDateString()}
                    </td>

                  </tr>

                ))
              )}

            </tbody>

          </table>
          </div>
          </div>
    </main>
)

}