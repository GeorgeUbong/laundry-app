"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { MoreVertical } from "lucide-react";
import { toast } from "react-toastify";
import {
  getStats,
  Order,
  getRecentOrders,
  getCustomers,
  getCategories,
  addOrder,
  Category,
  Customer,
  deleteOrder,
  updateOrderStatus,
} from "@/apis/userRoutes";
import { Button } from "@/_components/button";
import { Card } from "@/_components/card";
import { Modal } from "@/_components/modal";
import Loading from "./loading";

type DashboardStats = {
  categories: number;
  customers: number;
  income: number;
  orders: number;
};

type OrderFilter = "all" | "pending" | "ready";

export default function OrdersPage() {
  const [stats, setStats] = useState<DashboardStats>({
    categories: 0,
    customers: 0,
    income: 0,
    orders: 0,
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("all");
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [orderForm, setOrderForm] = useState({
    customerId: "",
    itemId: "",
    quantity: 1,
  });
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState("ready");
  const [pendingOrderAction, setPendingOrderAction] = useState<"status" | "delete" | null>(null);
  const [orderActionLoading, setOrderActionLoading] = useState(false);

  const loadPageData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Your session has expired");

      const [statsData, ordersData, customersData, categoriesData] = await Promise.all([
        getStats(token),
        getRecentOrders(token),
        getCustomers(token),
        getCategories(token),
      ]);

      setStats(statsData.dashboardData);
      setOrders(ordersData.orders);
      setCustomers(customersData.getCustomer);
      setCategories(categoriesData.categories);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load orders";
      toast.error(message);
      setError(message);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const refreshPage = async (message?: string) => {
    if (message) toast.success(message);
    await loadPageData(false);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPageData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadPageData]);

  const filteredCustomers = customers.filter((customer) => {
    const search = customerSearch.toLowerCase();
    return (
      customer.username.toLowerCase().includes(search) ||
      customer.phonenumber.toLowerCase().includes(search)
    );
  });

  const categoryItems = categories.flatMap((category) =>
    category.items.map((item) => ({ ...item, categoryName: category.name }))
  );
  const selectedOrderCustomer = customers.find(
    (customer) => customer.id === Number(orderForm.customerId)
  );
  const selectedOrderItem = categoryItems.find(
    (item) => item.id === Number(orderForm.itemId)
  );
  const orderTotal = selectedOrderItem
    ? selectedOrderItem.price * orderForm.quantity
    : 0;
  const hasInsufficientBalance = Boolean(
    selectedOrderCustomer && orderTotal > selectedOrderCustomer.balance
  );
  const visibleOrders = orders.filter((order) =>
    orderFilter === "all" ? true : order.status.toLowerCase() === orderFilter
  );

  const handleCreateOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Your session has expired");
      if (hasInsufficientBalance) {
        toast.error("Order total exceeds the customer balance");
        return;
      }

      setOrderSubmitting(true);
      await addOrder(
        {
          customerId: Number(orderForm.customerId),
          items: [{ itemId: Number(orderForm.itemId), quantity: orderForm.quantity }],
        },
        token
      );

      setOrderForm({ customerId: "", itemId: "", quantity: 1 });
      setCustomerSearch("");
      setIsOrderModalOpen(false);
      await refreshPage("Order created");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create order";
      toast.error(message);
      setError(message);
    } finally {
      setOrderSubmitting(false);
    }
  };

  const handleDeleteSelectedOrder = async () => {
    if (!selectedOrder) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Your session has expired");

      setOrderActionLoading(true);
      await deleteOrder(selectedOrder.id, token);
      setSelectedOrder(null);
      setPendingOrderAction(null);
      await refreshPage("Order deleted");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete order";
      toast.error(message);
      setError(message);
    } finally {
      setOrderActionLoading(false);
    }
  };

  const handleUpdateSelectedOrder = async () => {
    if (!selectedOrder) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Your session has expired");

      setOrderActionLoading(true);
      await updateOrderStatus(selectedOrder.id, { status: orderStatus }, token);
      setSelectedOrder(null);
      setPendingOrderAction(null);
      await refreshPage("Alert admin to reverse transactions");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update order";
      toast.error(message);
      setError(message);
    } finally {
      setOrderActionLoading(false);
    }
  };

  const handleOrderActionConfirmation = async () => {
    if (pendingOrderAction === "status") {
      await handleUpdateSelectedOrder();
    } else if (pendingOrderAction === "delete") {
      await handleDeleteSelectedOrder();
    }
  };

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
      <main className="min-h-screen bg-app-bg p-6 text-app-text">
        <p className="text-red-500">{error}</p>
      </main>
    );
  }

  return (
    <main className="page-enter min-w-0 bg-app-bg p-4 text-app-text sm:p-6 lg:p-8">
      {/* ================= HEADER ================= */}
      <h1 className="mb-2 text-2xl font-bold sm:text-3xl">
        Orders
      </h1>

      <h3 className="mb-6 text-base text-grey-surface sm:text-xl">
        View and manage orders
      </h3>

      {/* ================= BUTTON ================= */}
      <div className="mb-6 flex items-center">
        <Button onClick={() => setIsOrderModalOpen(true)} size="lg">
          Create order
        </Button>
      </div>

      {/* ================= STATS ================= */}
      <div className="stagger-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* Customers */}
        <Card className="p-6">
          <p className="text-sm text-grey-surface">
            Customers
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {stats.customers}
          </h2>
        </Card>

        {/* Orders */}
        <Card className="p-6">
          <p className="text-sm text-grey-surface">
            Orders
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {stats.orders}
          </h2>
        </Card>

        {/* Categories */}
        <Card className="p-6">
          <p className="text-sm text-grey-surface">
            Categories
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {stats.categories}
          </h2>
        </Card>

        {/* Income */}
        <Card className="p-6">
          <p className="text-sm text-grey-surface">
            Income
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            ₦{stats.income?.toLocaleString() ?? "0"}
          </h2>
        </Card>
      </div>

      {/* ================= ORDERS TABLE ================= */}
      <div className="table-enter mt-8">

        {/* ===== FILTER PILLS (MOVED ABOVE TABLE) ===== */}
        <div className="mb-4 flex flex-wrap gap-2">
          {(["all", "pending", "ready"] as OrderFilter[]).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setOrderFilter(filter)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${
                orderFilter === filter
                  ? "bg-brand-primary text-white"
                  : "text-grey-surface hover:bg-grey-light hover:text-app-text dark:hover:bg-grey-dark"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* ===== TABLE CONTAINER ===== */}
        <Card className="min-w-0 overflow-hidden p-0">

          <div className="overflow-x-auto">
            <table className="min-w-[48rem] w-full text-left text-sm">

              {/* ================= TABLE HEADER ================= */}

              <thead className="border-b border-card-border bg-app-bg">
                <tr>

                  <th className="px-6 py-4 text-sm font-semibold text-app-text">
                    Order
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-app-text">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-app-text">
                    Phone
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-app-text">
                    Items
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-app-text">
                    Total
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-app-text">
                    Status
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-app-text">
                    Date
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-app-text">
                    Actions
                  </th>

                </tr>
              </thead>

              {/* ================= TABLE BODY ================= */}

              <tbody className="divide-y divide-card-border">

                {visibleOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-12 text-center text-grey-surface"
                    >
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  visibleOrders.map((order) => (

                    <tr
                      key={order.id}
                      className="border-b border-card-border transition hover:bg-grey-light dark:hover:bg-grey-dark"
                    >

                      {/* Order ID */}
                      <td className="px-6 py-5">
                        <span className="font-semibold text-app-text">
                          #{order.id}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-5">
                        <span className="font-medium text-app-text">
                          {order.customer.username}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-5 text-grey-surface">
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
                              <span className="text-app-text">
                                {orderItem.item.name}
                              </span>

                              <span className="ml-2 text-grey-surface">
                                × {orderItem.quantity}
                              </span>
                            </div>
                          ))}

                        </div>

                      </td>

                      {/* Total */}
                      <td className="px-6 py-5">
                        <span className="font-semibold text-green-400">
                          ₦{(
                            order.totalAmount ??
                            order.items.reduce(
                              (total, orderItem) =>
                                total + orderItem.price * orderItem.quantity,
                              0
                            )
                          ).toLocaleString()}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            order.status.toLowerCase() === "pending"
                              ? "bg-yellow-500/10 text-yellow-400"
                              : order.status.toLowerCase() === "ready" || order.status.toLowerCase() === "completed"
                              ? "bg-green-500/10 text-green-400"
                              : "bg-gray-500/10 text-gray-400"
                          }`}
                        >
                          {order.status}
                        </span>

                      </td>

                      {/* Date */}
                      <td className="px-6 py-5 text-sm text-grey-surface">
                        {new Date(
                          order.createdAt
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrder(order);
                            setOrderStatus(order.status === "ready" ? "ready" : "pending");
                            setPendingOrderAction(null);
                          }}
                          className="rounded-lg p-2 text-grey-surface hover:bg-grey-light hover:text-app-text dark:hover:bg-grey-dark"
                          aria-label={`Open actions for order ${order.id}`}
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </td>

                    </tr>

                  ))
                )}

              </tbody>

            </table>
          </div>
        </Card>
      </div>

      {/* ================= ORDER ACTIONS MODAL ================= */}
      <Modal
        isOpen={selectedOrder !== null}
        onClose={() => setSelectedOrder(null)}
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="border-b border-card-border pb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-primary">
                Order actions
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Order #{selectedOrder.id}
              </h2>
              <p className="mt-1 text-sm text-grey-surface">
                Current status: {selectedOrder.status}
              </p>
            </div>

            <label className="block text-sm font-medium">
              Order status
              <select
                value={orderStatus}
                onChange={(event) => {
                  setOrderStatus(event.target.value);
                  setPendingOrderAction("status");
                }}
                className="mt-2 w-full rounded-lg border border-card-border bg-app-bg px-3 py-2 text-app-text outline-none focus:border-brand-primary"
              >
                <option value="ready">Ready</option>
                <option value="pending">Pending</option>
              </select>
            </label>

            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingOrderAction("delete")}
              disabled={orderActionLoading}
              className="w-full border-red-500/40 text-red-400 hover:bg-red-500/10"
            >
              Delete order
            </Button>

            {pendingOrderAction && (
              <div className="rounded-xl border border-brand-primary/30 bg-brand-light/10 p-4">
                <p className="text-sm text-app-text">
                  {pendingOrderAction === "delete"
                    ? "Delete this order?"
                    : `Change order status to ${orderStatus}?`}
                </p>
                <div className="mt-4 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPendingOrderAction(null)}
                    disabled={orderActionLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleOrderActionConfirmation}
                    disabled={orderActionLoading}
                  >
                    {orderActionLoading ? "Working..." : "OK"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ================= CREATE ORDER MODAL ================= */}
      <Modal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
      >
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Create order</h2>
            <p className="mt-1 text-sm text-grey-surface">
              Choose a customer, laundry item, and quantity.
            </p>
          </div>

          <label className="block text-sm font-medium">
            Customer
            <input
              required
              value={customerSearch}
              onChange={(event) => {
                setCustomerSearch(event.target.value);
                setOrderForm((currentForm) => ({
                  ...currentForm,
                  customerId: "",
                }));
              }}
              placeholder="Search by username or phone number"
              className="mt-1 w-full rounded-lg border border-card-border bg-app-bg px-3 py-2 text-app-text outline-none placeholder:text-grey-surface focus:border-brand-primary"
            />
            <select
              required
              value={orderForm.customerId}
              onChange={(event) => {
                const customer = customers.find(
                  (item) => item.id === Number(event.target.value)
                );
                setOrderForm((currentForm) => ({
                  ...currentForm,
                  customerId: event.target.value,
                }));
                setCustomerSearch(customer?.username ?? "");
              }}
              className="mt-2 w-full rounded-lg border border-card-border bg-app-bg px-3 py-2 text-app-text outline-none focus:border-brand-primary"
            >
              <option value="">Select customer</option>
              {filteredCustomers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.username} - {customer.phonenumber}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium">
            Item
            <select
              required
              value={orderForm.itemId}
              onChange={(event) =>
                setOrderForm((currentForm) => ({
                  ...currentForm,
                  itemId: event.target.value,
                }))
              }
              className="mt-1 w-full rounded-lg border border-card-border bg-app-bg px-3 py-2 text-app-text outline-none focus:border-brand-primary"
            >
              <option value="">Select item</option>
              {categoryItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.categoryName} - {item.name} (₦{item.price.toLocaleString()})
                </option>
              ))}
            </select>
          </label>

          {selectedOrderItem && (
            <div className="rounded-lg border border-card-border bg-app-bg p-3 text-sm">
              <div className="flex justify-between text-grey-surface">
                <span>Order total</span>
                <span className="font-semibold text-app-text">
                  ₦{orderTotal.toLocaleString()}
                </span>
              </div>
              {hasInsufficientBalance && (
                <p className="mt-2 text-red-400">
                  This order exceeds the customer&apos;s balance of ₦
                  {selectedOrderCustomer?.balance.toLocaleString()}. Add balance before creating it.
                </p>
              )}
            </div>
          )}

          <label className="block text-sm font-medium">
            Quantity
            <input
              required
              min="1"
              type="number"
              value={orderForm.quantity}
              onChange={(event) =>
                setOrderForm((currentForm) => ({
                  ...currentForm,
                  quantity: Math.max(1, Number(event.target.value)),
                }))
              }
              className="mt-1 w-full rounded-lg border border-card-border bg-app-bg px-3 py-2 text-app-text outline-none focus:border-brand-primary"
            />
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOrderModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={orderSubmitting || hasInsufficientBalance}>
              {orderSubmitting ? "Creating..." : "Create order"}
            </Button>
          </div>
        </form>
      </Modal>

    </main>
  );
}