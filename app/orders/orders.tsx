"use client";

import { useEffect, useState } from "react";
import {
  getOrders,
  getRecentOrders,
  getCompletedOrders,
  getOrder,
  deleteOrder,
  updateOrderStatus,
  completeOrder,
} from "../../api/employee/routes";

type Order = {
  id?: string | number;
  customerId?: string | number;
  customer?: {
    username?: string;
    phonenumber?: string;
  };
  status?: string;
  total?: number;
  amount?: number;
  price?: number;
  createdAt?: string;
  updatedAt?: string;
};

type OrdersObject = {
  all: Order[];
  recent: Order[];
  completed: Order[];
};

function normalizeOrders(data: unknown): Order[] {
  if (Array.isArray(data)) {
    return data as Order[];
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const response = data as Record<string, unknown>;
  const nestedOrders = response.orders ?? response.data;

  if (Array.isArray(nestedOrders)) {
    return nestedOrders as Order[];
  }

  return Object.values(response).filter(
  (value): value is Order =>
    value !== null &&
    typeof value === "object" &&
    ("id" in value || "status" in value)
);
}

export default function Order() {
  const [orders, setOrders] = useState<OrdersObject>({
    all: [],
    recent: [],
    completed: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<keyof OrdersObject>("all");

  // Load all order types on mount
  useEffect(() => {
    const loadAllOrders = async () => {
      try {
        setLoading(true);

        const [allData, recentData, completedData] = await Promise.all([
          getOrders(),
          getRecentOrders(),
          getCompletedOrders(),
        ]);

        setOrders({
          all: normalizeOrders(allData),
          recent: normalizeOrders(recentData),
          completed: normalizeOrders(completedData),
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load orders"
        );
      } finally {
        setLoading(false);
      }
    };

    loadAllOrders();
  }, []);

  // Switch filter without reloading
  const handleFilterChange = (filter: keyof OrdersObject) => {
    setActiveFilter(filter);
  };

  // Get single order
  const handleGetOrder = async (id: string | number) => {
    try {
      const data = await getOrder(String(id));
      console.log("Order:", data);
    } catch (err) {
      setError("Failed to get order");
    }
  };

  // Delete order from all relevant arrays
  const handleDeleteOrder = async (id: string | number) => {
    try {
      await deleteOrder(String(id));

      setOrders((prev) => ({
        all: prev.all.filter((order) => order.id !== id),
        recent: prev.recent.filter((order) => order.id !== id),
        completed: prev.completed.filter((order) => order.id !== id),
      }));
    } catch (err) {
      setError("Failed to delete order");
    }
  };

  // Complete order in all relevant arrays
  const handleCompleteOrder = async (id: string | number) => {
    try {
      const updated = await completeOrder(String(id));

      setOrders((prev) => ({
        all: prev.all.map((order) =>
          order.id === id ? updated : order
        ),
        recent: prev.recent.map((order) =>
          order.id === id ? updated : order
        ),
        completed: prev.completed.map((order) =>
          order.id === id ? updated : order
        ),
      }));
    } catch (err) {
      setError("Failed to complete order");
    }
  };

  // Update status in all relevant arrays
  const handleUpdateStatus = async (
    id: string | number,
    status: string
  ) => {
    try {
      const updated = await updateOrderStatus(
        String(id),
        { status }
      );

      setOrders((prev) => ({
        all: prev.all.map((order) =>
          order.id === id ? updated : order
        ),
        recent: prev.recent.map((order) =>
          order.id === id ? updated : order
        ),
        completed: prev.completed.map((order) =>
          order.id === id ? updated : order
        ),
      }));
    } catch (err) {
      setError("Failed to update order status");
    }
  };

  const getStatusStyle = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
      case "canceled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getOrderAmount = (order: Order) => {
    return order.total ?? order.amount ?? order.price ?? 0;
  };

  const currentOrders = orders[activeFilter];

  if (loading) {
    return (
      <div className="p-6 text-gray-500">
        Loading orders...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-5 text-red-600">
        <p>{error}</p>
        <button
          onClick={() => setError(null)}
          className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm text-white"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <section className="w-full">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Orders
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track customer laundry orders.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Orders
          </p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {orders.all.length}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Pending Orders
          </p>
          <h2 className="mt-2 text-3xl font-bold text-yellow-600">
            {
              orders.all.filter(
                (order) =>
                  order.status?.toLowerCase() === "pending"
              ).length
            }
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Completed Orders
          </p>
          <h2 className="mt-2 text-3xl font-bold text-green-600">
            {orders.completed.length}
          </h2>
        </div>
      </div>

      {/* Orders container */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Top controls */}
        <div className="flex flex-col gap-4 border-b border-gray-200 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Order List
            </h2>
            <p className="text-sm text-gray-500">
              View and manage orders
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleFilterChange("all")}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                activeFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>

            <button
              onClick={() => handleFilterChange("recent")}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                activeFilter === "recent"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Recent
            </button>

            <button
              onClick={() => handleFilterChange("completed")}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                activeFilter === "completed"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                  Order
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                  Customer
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                  Amount
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                  Date
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {currentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="transition hover:bg-gray-50"
                >
                  {/* Order ID */}
                  <td className="px-6 py-5">
                    <p className="font-semibold text-gray-900">
                      #{order.id}
                    </p>
                    <p className="text-xs text-gray-400">
                      Customer ID: {order.customerId ?? "N/A"}
                    </p>
                  </td>

                  {/* Customer */}
                  <td className="px-6 py-5">
                    <p className="font-medium text-gray-900">
                      {order.customer?.username ??
                        `Customer ${order.customerId ?? ""}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.customer?.phonenumber ?? "N/A"}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-5">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                        order.status
                      )}`}
                    >
                      {order.status ?? "Unknown"}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="px-6 py-5 font-semibold text-gray-900">
                    ₦{getOrderAmount(order).toLocaleString()}
                  </td>

                  {/* Date */}
                  <td className="px-6 py-5 text-sm text-gray-500">
                    {order.createdAt
                      ? new Date(
                          order.createdAt
                        ).toLocaleDateString()
                      : "N/A"}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() =>
                          order.id &&
                          handleGetOrder(order.id)
                        }
                        className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
                      >
                        View
                      </button>

                      <button
                        onClick={() =>
                          order.id &&
                          handleCompleteOrder(order.id)
                        }
                        className="rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-100"
                      >
                        Complete
                      </button>

                      <button
                        onClick={() =>
                          order.id &&
                          handleDeleteOrder(order.id)
                        }
                        className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {currentOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl">
              📦
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              No orders found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              There are currently no orders to display.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}