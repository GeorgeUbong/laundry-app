"use client";

import { useEffect, useState } from "react";

import {
  getStatistics,
  getCustomers,
  getRecentOrders,
} from "../../api/employee/routes";

export default function DashboardPage() {
  const [statistics, setStatistics] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);

        // Get dashboard statistics
        const statisticsData = await getStatistics();

        // Get customers
        const customersData = await getCustomers();

        // Get recent orders
        const ordersData = await getRecentOrders();

        setStatistics(statisticsData);
        setCustomers(customersData);
        setOrders(ordersData);
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load dashboard");
        }
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>

            <p className="mt-4 text-sm text-gray-500">
              Loading dashboard...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 className="font-semibold text-red-700">
            Unable to load dashboard
          </h2>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Overview of your laundry business.
        </p>
      </div>


      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

        {/* Customers */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Customers
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {statistics?.customers ?? 0}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl">
              👥
            </div>
          </div>
        </div>


        {/* Orders */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Orders
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {statistics?.orders ?? 0}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-xl">
              📦
            </div>
          </div>
        </div>


        {/* Completed */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Completed Orders
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {statistics?.completed ?? 0}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-xl">
              ✓
            </div>
          </div>
        </div>


        {/* Revenue */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Revenue
              </p>

              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                ₦{statistics?.revenue ?? 0}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50 text-xl">
              ₦
            </div>
          </div>
        </div>

      </section>


      {/* =====================================================
          CUSTOMERS + ORDERS
      ===================================================== */}

      <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">


        {/* =====================================================
            CUSTOMERS TABLE
        ===================================================== */}

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

            <div>
              <h2 className="font-semibold text-gray-900">
                Customers
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Recently registered customers
              </p>
            </div>

            <a
              href="/customers"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all
            </a>

          </div>


          {/* Table */}
          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Customer
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Phone
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Balance
                  </th>
                </tr>
              </thead>


              <tbody className="divide-y divide-gray-100">

                {customers.length > 0 ? (
                  customers.slice(0, 5).map((customer) => (

                    <tr
                      key={customer.id}
                      className="transition hover:bg-gray-50"
                    >

                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                            {customer.name
                              ?.charAt(0)
                              ?.toUpperCase() || "C"}
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {customer.name || "Unknown"}
                            </p>

                            <p className="text-xs text-gray-500">
                              {customer.email || "No email"}
                            </p>
                          </div>

                        </div>
                      </td>


                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {customer.phonenumber ||
                          customer.phone ||
                          "N/A"}
                      </td>


                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        ₦{customer.balance ?? 0}
                      </td>

                    </tr>

                  ))
                ) : (

                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-10 text-center text-sm text-gray-500"
                    >
                      No customers found.
                    </td>
                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>


        {/* =====================================================
            ORDERS TABLE
        ===================================================== */}

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

            <div>
              <h2 className="font-semibold text-gray-900">
                Recent Orders
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Latest laundry orders
              </p>
            </div>

            <a
              href="/orders"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all
            </a>

          </div>


          {/* Table */}
          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-gray-50">

                <tr>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Order
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Customer
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Amount
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-gray-100">

                {orders.length > 0 ? (
                  orders.slice(0, 5).map((order) => (

                    <tr
                      key={order.id}
                      className="transition hover:bg-gray-50"
                    >

                      <td className="whitespace-nowrap px-6 py-4">

                        <p className="text-sm font-semibold text-gray-900">
                          #{order.id}
                        </p>

                      </td>


                      <td className="whitespace-nowrap px-6 py-4">

                        <p className="text-sm text-gray-700">
                          {order.customer?.name ||
                            order.customerName ||
                            "Unknown"}
                        </p>

                      </td>


                      <td className="whitespace-nowrap px-6 py-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            order.status === "COMPLETED"
                              ? "bg-green-100 text-green-700"
                              : order.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {order.status || "Unknown"}
                        </span>

                      </td>


                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        ₦{order.totalAmount ??
                          order.amount ??
                          0}
                      </td>

                    </tr>

                  ))
                ) : (

                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-10 text-center text-sm text-gray-500"
                    >
                      No orders found.
                    </td>
                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </section>

    </main>
  );
}