"use client";

import { useEffect, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { toast } from "react-toastify";

import {
  getStats,
  getRecentOrders,
  Order,
  reversePayment,
} from "@/apis/adminRoutes";

import { Modal } from "@/_components/modal";
import Loading from "@/loading";

type DashboardStats = {
  categories: number;
  customers: number;
  income: number;
  orders: number;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const [stats, setStats] = useState<DashboardStats>({
    categories: 0,
    customers: 0,
    income: 0,
    orders: 0,
  });

  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reversing, setReversing] = useState(false);

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token2");

        if (!token) {
          toast.error("Your session has expired. Please log in again.");
          return;
        }

        // Get statistics and recent orders at the same time
        const [statsData, recentOrders] = await Promise.all([
          getStats(token),
          getRecentOrders(token),
        ]);

        // Set statistics
        setStats(statsData.dashboardData);

        // Set orders
        setOrders(recentOrders);
      } catch (error) {
        console.error("Failed to load orders page:", error);

        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load orders"
        );
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, []);

  const handleReversePayment = async () => {
    if (!selectedOrder) return;

    const token = localStorage.getItem("token2");

    if (!token) {
      toast.error("Your session has expired. Please log in again.");
      return;
    }

    try {
      setReversing(true);

      const result = await reversePayment(
        selectedOrder.id,
        token
      );

      // Update the reversed order in the table
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === selectedOrder.id
            ? result.order
            : order
        )
      );

      // Update statistics after reversing payment
      setStats((currentStats) => ({
        ...currentStats,
        income:
          currentStats.income -
          (selectedOrder.totalAmount ?? 0),
      }));

      setSelectedOrder(null);

      toast.success("Payment reversed successfully");
    } catch (error) {
      console.error("Failed to reverse payment:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to reverse payment"
      );
    } finally {
      setReversing(false);
    }
  };

  if (loading) {
    return (
      <main>
        <Loading />
      </main>
    );
  }

  return (
    <main className="page-enter min-h-screen bg-black p-4 text-white sm:p-6">
      {/* ================= HEADER ================= */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Recent Orders
        </h1>

        <p className="mt-2 text-gray-400">
          Review transactions and reverse payments when needed.
        </p>
      </div>

      {/* ================= STATISTICS ================= */}
      <div className="stagger-grid mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {/* Customers */}
        <div className="min-w-0 rounded-xl border border-gray-800 bg-gray-900 p-4 sm:p-6">
          <p className="text-sm text-gray-400">
            Customers
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {stats.customers}
          </h2>
        </div>

        {/* Orders */}
        <div className="min-w-0 rounded-xl border border-gray-800 bg-gray-900 p-4 sm:p-6">
          <p className="text-sm text-gray-400">
            Orders
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {stats.orders}
          </h2>
        </div>

        {/* Categories */}
        <div className="min-w-0 rounded-xl border border-gray-800 bg-gray-900 p-4 sm:p-6">
          <p className="text-sm text-gray-400">
            Categories
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {stats.categories}
          </h2>
        </div>

        {/* Income */}
        <div className="min-w-0 rounded-xl border border-gray-800 bg-gray-900 p-4 sm:p-6">
          <p className="text-sm text-gray-400">
            Income
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            ₦{stats.income.toLocaleString()}
          </h2>
        </div>
      </div>

      {/* ================= ORDERS ================= */}
      <div className="rounded-xl border border-gray-800 bg-gray-900">
        {/* Table Header */}
        <div className="border-b border-gray-800 p-6">
          <h2 className="text-xl font-semibold">
            Orders
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            All recent customer transactions
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                {[
                  "ID",
                  "Name",
                  "Phone Number",
                  "Items",
                  "Status",
                  "Total",
                  "Date",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-6 py-4 font-medium"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-800 transition hover:bg-gray-800/50"
                  >
                    {/* ID */}
                    <td className="px-6 py-4 text-gray-400">
                      {order.id}
                    </td>

                    {/* Customer Name */}
                    <td className="px-6 py-4 font-medium">
                      {order.customer.username}
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4 text-gray-300">
                      {order.customer.phonenumber}
                    </td>

                    {/* Items */}
                    <td className="max-w-xs px-6 py-4 text-gray-300">
                      {order.items
                        .map(
                          (item) =>
                            `${item.item.name} x${item.quantity}`
                        )
                        .join(", ")}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 capitalize text-gray-300">
                      {order.status}
                    </td>

                    {/* Total */}
                    <td className="px-6 py-4 font-medium">
                      ₦
                      {(
                        order.totalAmount ?? 0
                      ).toLocaleString()}
                    </td>

                    {/* Date */}
                    <td className="whitespace-nowrap px-6 py-4 text-gray-400">
                      {new Date(
                        order.createdAt
                      ).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        title={`Reverse payment for order ${order.id}`}
                        aria-label={`Reverse payment for order ${order.id}`}
                        onClick={() =>
                          setSelectedOrder(order)
                        }
                        className="rounded-md p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= REVERSE PAYMENT MODAL ================= */}
      <Modal
        isOpen={selectedOrder !== null}
        onClose={() =>
          !reversing && setSelectedOrder(null)
        }
      >
        <h2 className="text-xl font-semibold">
          Reverse payment?
        </h2>

        <p className="mt-2 text-gray-400">
          This will reverse the payment for order #
          {selectedOrder?.id} and update the customer
          balance.
        </p>

        {/* Order Information */}
        {selectedOrder && (
          <div className="mt-5 rounded-lg border border-gray-800 bg-gray-950 p-4">
            {/* Customer */}
            <div className="flex justify-between">
              <span className="text-gray-400">
                Customer
              </span>

              <span className="font-medium">
                {selectedOrder.customer.username}
              </span>
            </div>

            {/* Order */}
            <div className="mt-3 flex justify-between">
              <span className="text-gray-400">
                Order
              </span>

              <span>
                #{selectedOrder.id}
              </span>
            </div>

            {/* Amount */}
            <div className="mt-3 flex justify-between">
              <span className="text-gray-400">
                Amount
              </span>

              <span className="font-medium">
                ₦
                {(
                  selectedOrder.totalAmount ?? 0
                ).toLocaleString()}
              </span>
            </div>

            {/* Status */}
            <div className="mt-3 flex justify-between">
              <span className="text-gray-400">
                Current status
              </span>

              <span className="capitalize">
                {selectedOrder.status}
              </span>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setSelectedOrder(null)}
            disabled={reversing}
            className="rounded-lg border border-card-border px-4 py-2 text-sm text-app-text transition hover:bg-grey-dark/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleReversePayment}
            disabled={reversing}
            className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {reversing
              ? "Reversing..."
              : "Reverse payment"}
          </button>
        </div>
      </Modal>
    </main>
  );
}