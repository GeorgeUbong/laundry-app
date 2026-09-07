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

type OrderFilter = "all" | "pending" | "completed";

const getOrderStatus = (status: string | null | undefined) =>
  String(status ?? "pending").trim().toLowerCase();

const isAlreadyCompletedError = (message: string) =>
  message.toLowerCase().includes("already") &&
  message.toLowerCase().includes("completed");

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

  const [orderStatus, setOrderStatus] = useState("completed");

  const [pendingOrderAction, setPendingOrderAction] = useState<
    "status" | "delete" | null
  >(null);

  const [orderActionLoading, setOrderActionLoading] = useState(false);

  // =========================================================
  // LOAD PAGE DATA
  // =========================================================

  const loadPageData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Your session has expired");
      }

      const [
        statsData,
        ordersData,
        customersData,
        categoriesData,
      ] = await Promise.all([
        getStats(token),
        getRecentOrders(token),
        getCustomers(token),
        getCategories(token),
      ]);

      // =====================================================
      // FIX STATS RESPONSE
      // =====================================================

      console.log("Stats API response:", statsData);

      const rawStats =
        (statsData as any)?.dashboardData ??
        (statsData as any)?.data ??
        statsData;

      const dashboardStats: DashboardStats = {
        customers: Number(
          rawStats?.customers ??
            rawStats?.customerCount ??
            rawStats?.totalCustomers ??
            0
        ),

        orders: Number(
          rawStats?.orders ??
            rawStats?.orderCount ??
            rawStats?.totalOrders ??
            0
        ),

        categories: Number(
          rawStats?.categories ??
            rawStats?.categoryCount ??
            rawStats?.totalCategories ??
            0
        ),

        income: Number(
          rawStats?.income ??
            rawStats?.totalIncome ??
            rawStats?.revenue ??
            0
        ),
      };

      console.log("Processed dashboard stats:", dashboardStats);

      setStats(dashboardStats);

      // =====================================================
      // ORDERS
      // =====================================================

      setOrders(ordersData?.orders ?? []);

      // =====================================================
      // CUSTOMERS
      // =====================================================

      setCustomers(customersData?.getCustomer ?? []);

      // =====================================================
      // CATEGORIES
      // =====================================================

      setCategories(categoriesData?.categories ?? []);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load dashboard data";

      console.error("Dashboard loading error:", err);

      toast.error(message);
      setError(message);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  // =========================================================
  // REFRESH
  // =========================================================

  const refreshPage = async (message?: string) => {
    if (message) {
      toast.success(message);
    }

    await loadPageData(false);
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPageData();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadPageData]);

  // =========================================================
  // CUSTOMER SEARCH
  // =========================================================

  const filteredCustomers = customers.filter((customer) => {
    const search = customerSearch.toLowerCase().trim();

    return (
      customer.username?.toLowerCase().includes(search) ||
      customer.phonenumber?.toLowerCase().includes(search)
    );
  });

  // =========================================================
  // CATEGORY ITEMS
  // =========================================================

  const categoryItems = categories.flatMap((category) =>
    (category.items ?? []).map((item) => ({
      ...item,
      categoryName: category.name,
    }))
  );

  // =========================================================
  // SELECTED CUSTOMER
  // =========================================================

  const selectedOrderCustomer = customers.find(
    (customer) => customer.id === Number(orderForm.customerId)
  );

  // =========================================================
  // SELECTED ITEM
  // =========================================================

  const selectedOrderItem = categoryItems.find(
    (item) => item.id === Number(orderForm.itemId)
  );

  // =========================================================
  // ORDER TOTAL
  // =========================================================

  const orderTotal = selectedOrderItem
    ? Number(selectedOrderItem.price) * orderForm.quantity
    : 0;

  // =========================================================
  // BALANCE CHECK
  // =========================================================

  const hasInsufficientBalance = Boolean(
    selectedOrderCustomer &&
      orderTotal > Number(selectedOrderCustomer.balance)
  );

  // =========================================================
  // FILTERED ORDERS
  // =========================================================

  const visibleOrders = orders.filter((order) =>
    orderFilter === "all"
      ? true
      : getOrderStatus(order.status) === orderFilter
  );

  // =========================================================
  // CREATE ORDER
  // =========================================================

  const handleCreateOrder = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Your session has expired");
      }

      if (!orderForm.customerId) {
        toast.error("Please select a customer");
        return;
      }

      if (!orderForm.itemId) {
        toast.error("Please select an item");
        return;
      }

      if (hasInsufficientBalance) {
        toast.error("Order total exceeds the customer balance");
        return;
      }

      setOrderSubmitting(true);

      await addOrder(
        {
          customerId: Number(orderForm.customerId),
          items: [
            {
              itemId: Number(orderForm.itemId),
              quantity: orderForm.quantity,
            },
          ],
        },
        token
      );

      setOrderForm({
        customerId: "",
        itemId: "",
        quantity: 1,
      });

      setCustomerSearch("");

      setIsOrderModalOpen(false);

      await refreshPage("Order created");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to create order";

      toast.error(message);
      setError(message);
    } finally {
      setOrderSubmitting(false);
    }
  };

  // =========================================================
  // DELETE ORDER
  // =========================================================

  const handleDeleteSelectedOrder = async () => {
    if (!selectedOrder) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Your session has expired");
      }

      setOrderActionLoading(true);

      await deleteOrder(selectedOrder.id, token);

      setSelectedOrder(null);
      setPendingOrderAction(null);

      await refreshPage("Order deleted");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to delete order";

      toast.error(message);
      setError(message);
    } finally {
      setOrderActionLoading(false);
    }
  };

  // =========================================================
  // UPDATE ORDER STATUS
  // =========================================================

  const handleUpdateSelectedOrder = async () => {
    if (!selectedOrder) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Your session has expired");
      }

      setOrderActionLoading(true);

      await updateOrderStatus(
        selectedOrder.id,
        {
          status: orderStatus,
        },
        token
      );

      setSelectedOrder(null);
      setPendingOrderAction(null);

      await refreshPage("Order status updated");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to update order";

      toast.error(message);
      if (isAlreadyCompletedError(message)) {
        setSelectedOrder(null);
        setPendingOrderAction(null);
        await loadPageData(false);
      } else {
        setError(message);
      }
    } finally {
      setOrderActionLoading(false);
    }
  };

  // =========================================================
  // CONFIRM ORDER ACTION
  // =========================================================

  const handleOrderActionConfirmation = async () => {
    if (pendingOrderAction === "status") {
      await handleUpdateSelectedOrder();
    }

    if (pendingOrderAction === "delete") {
      await handleDeleteSelectedOrder();
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main>
        <Loading />
      </main>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <main className="min-h-screen bg-app-bg p-6 text-app-text">
        <div className="mx-auto max-w-2xl rounded-xl border border-red-500/30 bg-red-500/10 p-6">
          <h2 className="text-lg font-semibold text-red-400">
            Something went wrong
          </h2>

          <p className="mt-2 text-sm text-red-300">
            {error}
          </p>

          <Button
            className="mt-4"
            onClick={() => {
              setError("");
              void loadPageData();
            }}
          >
            Try again
          </Button>
        </div>
      </main>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main className="page-enter min-w-0 bg-app-bg p-4 text-app-text sm:p-6 lg:p-8">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">
          Orders
        </h1>

        <p className="mt-1 text-base text-grey-surface sm:text-xl">
          View and manage orders
        </p>
      </div>

      {/* =====================================================
          CREATE ORDER BUTTON
      ===================================================== */}

      <div className="mb-6 flex items-center">
        <Button
          onClick={() => {
            setIsOrderModalOpen(true);
            setError("");
          }}
          size="lg"
        >
          Create order
        </Button>
      </div>

      {/* =====================================================
          STATS
      ===================================================== */}

      <div className="stagger-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* CUSTOMERS */}

        <Card className="p-6">
          <p className="text-sm text-grey-surface">
            Customers
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {stats.customers.toLocaleString()}
          </h2>
        </Card>

        {/* ORDERS */}

        <Card className="p-6">
          <p className="text-sm text-grey-surface">
            Orders
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {stats.orders.toLocaleString()}
          </h2>
        </Card>

        {/* CATEGORIES */}

        <Card className="p-6">
          <p className="text-sm text-grey-surface">
            Categories
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {stats.categories.toLocaleString()}
          </h2>
        </Card>

        {/* INCOME */}

        <Card className="p-6">
          <p className="text-sm text-grey-surface">
            Income
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            ₦{Number(stats.income || 0).toLocaleString()}
          </h2>
        </Card>
      </div>

      {/* =====================================================
          ORDER FILTER
      ===================================================== */}

      <div className="table-enter mt-8">

        <div className="mb-4 flex flex-wrap gap-2">
          {(
            ["all", "pending", "completed"] as OrderFilter[]
          ).map((filter) => (
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

        {/* ===================================================
            ORDERS TABLE
        =================================================== */}

        <Card className="min-w-0 overflow-hidden p-0">

          <div className="overflow-x-auto">

            <table className="min-w-[48rem] w-full text-left text-sm">

              <thead className="border-b border-card-border bg-app-bg">

                <tr>
                  <th className="px-6 py-4 font-semibold">
                    Order
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Customer
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Phone
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Items
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Total
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Status
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Date
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Actions
                  </th>
                </tr>

              </thead>

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
                  visibleOrders.map((order) => {

                    const total =
                      Number(order.totalAmount) ||
                      order.items.reduce(
                        (sum, orderItem) =>
                          sum +
                          Number(orderItem.price) *
                            Number(orderItem.quantity),
                        0
                      );

                    const status = getOrderStatus(order.status);

                    return (
                      <tr
                        key={order.id}
                        className="border-b border-card-border transition hover:bg-grey-light dark:hover:bg-grey-dark"
                      >

                        {/* ORDER ID */}

                        <td className="px-6 py-5">
                          <span className="font-semibold">
                            #{order.id}
                          </span>
                        </td>

                        {/* CUSTOMER */}

                        <td className="px-6 py-5">
                          <span className="font-medium">
                            {order.customer?.username ?? "Unknown"}
                          </span>
                        </td>

                        {/* PHONE */}

                        <td className="px-6 py-5 text-grey-surface">
                          {order.customer?.phonenumber ?? "-"}
                        </td>

                        {/* ITEMS */}

                        <td className="px-6 py-5">

                          <div className="space-y-1">

                            {order.items?.map((orderItem) => (
                              <div
                                key={orderItem.id}
                                className="text-sm"
                              >
                                <span>
                                  {orderItem.item?.name ?? "Item"}
                                </span>

                                <span className="ml-2 text-grey-surface">
                                  × {orderItem.quantity}
                                </span>
                              </div>
                            ))}

                          </div>

                        </td>

                        {/* TOTAL */}

                        <td className="px-6 py-5">

                          <span className="font-semibold text-green-400">
                            ₦{total.toLocaleString()}
                          </span>

                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-5">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              status === "pending"
                                ? "bg-yellow-500/10 text-yellow-400"
                                : status === "completed"
                                ? "bg-green-500/10 text-green-400"
                                : "bg-gray-500/10 text-gray-400"
                            }`}
                          >
                            {status}
                          </span>

                        </td>

                        {/* DATE */}

                        <td className="px-6 py-5 text-sm text-grey-surface">
                          {order.createdAt
                            ? new Date(
                                order.createdAt
                              ).toLocaleDateString()
                            : "-"}
                        </td>

                        {/* ACTIONS */}

                        <td className="px-6 py-5">

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrder(order);
                              setOrderStatus(status);
                              setPendingOrderAction(null);
                            }}
                            className="rounded-lg p-2 text-grey-surface hover:bg-grey-light hover:text-app-text dark:hover:bg-grey-dark"
                            aria-label={`Open actions for order ${order.id}`}
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>

                        </td>

                      </tr>
                    );
                  })
                )}

              </tbody>

            </table>

          </div>

        </Card>
      </div>

      {/* =====================================================
          ORDER ACTIONS MODAL
      ===================================================== */}

      <Modal
        isOpen={selectedOrder !== null}
        onClose={() => {
          if (!orderActionLoading) {
            setSelectedOrder(null);
            setPendingOrderAction(null);
          }
        }}
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
                Current status:{" "}
                {getOrderStatus(selectedOrder.status)}
              </p>

            </div>

            {/* STATUS */}

            <label className="block text-sm font-medium">

              Order status

              <select
                value={orderStatus}
                onChange={(event) => {
                  setOrderStatus(event.target.value);
                  setPendingOrderAction("status");
                }}
                disabled={orderActionLoading}
                className="mt-2 w-full rounded-lg border border-card-border bg-app-bg px-3 py-2 text-app-text outline-none focus:border-brand-primary"
              >
                <option value="completed">
                  Completed
                </option>

                <option value="pending">
                  Pending
                </option>
              </select>

            </label>

            {/* DELETE */}

            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingOrderAction("delete")}
              disabled={orderActionLoading}
              className="w-full border-red-500/40 text-red-400 hover:bg-red-500/10"
            >
              Delete order
            </Button>

            {/* CONFIRMATION */}

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
                    onClick={() =>
                      setPendingOrderAction(null)
                    }
                    disabled={orderActionLoading}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    onClick={
                      handleOrderActionConfirmation
                    }
                    disabled={orderActionLoading}
                  >
                    {orderActionLoading
                      ? "Working..."
                      : "OK"}
                  </Button>

                </div>

              </div>
            )}

          </div>
        )}

      </Modal>

      {/* =====================================================
          CREATE ORDER MODAL
      ===================================================== */}

      <Modal
        isOpen={isOrderModalOpen}
        onClose={() => {
          if (!orderSubmitting) {
            setIsOrderModalOpen(false);
          }
        }}
      >

        <form
          onSubmit={handleCreateOrder}
          className="space-y-4"
        >

          <div>

            <h2 className="text-xl font-semibold">
              Create order
            </h2>

            <p className="mt-1 text-sm text-grey-surface">
              Choose a customer, laundry item, and quantity.
            </p>

          </div>

          {/* CUSTOMER */}

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
                  (item) =>
                    item.id ===
                    Number(event.target.value)
                );

                setOrderForm((currentForm) => ({
                  ...currentForm,
                  customerId: event.target.value,
                }));

                setCustomerSearch(
                  customer?.username ?? ""
                );
              }}
              className="mt-2 w-full rounded-lg border border-card-border bg-app-bg px-3 py-2 text-app-text outline-none focus:border-brand-primary"
            >

              <option value="">
                Select customer
              </option>

              {filteredCustomers.map((customer) => (

                <option
                  key={customer.id}
                  value={customer.id}
                >
                  {customer.username} -{" "}
                  {customer.phonenumber}
                </option>

              ))}

            </select>

          </label>

          {/* ITEM */}

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

              <option value="">
                Select item
              </option>

              {categoryItems.map((item) => (

                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.categoryName} -{" "}
                  {item.name} (₦
                  {Number(item.price).toLocaleString()})
                </option>

              ))}

            </select>

          </label>

          {/* ORDER TOTAL */}

          {selectedOrderItem && (

            <div className="rounded-lg border border-card-border bg-app-bg p-3 text-sm">

              <div className="flex justify-between text-grey-surface">

                <span>
                  Order total
                </span>

                <span className="font-semibold text-app-text">
                  ₦{orderTotal.toLocaleString()}
                </span>

              </div>

              {/* INSUFFICIENT BALANCE */}

              {hasInsufficientBalance && (

                <p className="mt-2 text-red-400">
                  This order exceeds the
                  customer&apos;s balance of ₦
                  {Number(
                    selectedOrderCustomer?.balance ?? 0
                  ).toLocaleString()}
                  . Add balance before creating it.
                </p>

              )}

            </div>

          )}

          {/* QUANTITY */}

          <label className="block text-sm font-medium">

            Quantity

            <input
              required
              min="1"
              type="number"
              value={orderForm.quantity}
              onChange={(event) => {

                const quantity =
                  Number(event.target.value);

                setOrderForm((currentForm) => ({
                  ...currentForm,
                  quantity:
                    Number.isFinite(quantity) &&
                    quantity > 0
                      ? quantity
                      : 1,
                }));

              }}
              className="mt-1 w-full rounded-lg border border-card-border bg-app-bg px-3 py-2 text-app-text outline-none focus:border-brand-primary"
            />

          </label>

          {/* BUTTONS */}

          <div className="flex justify-end gap-3 pt-2">

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setIsOrderModalOpen(false)
              }
              disabled={orderSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                orderSubmitting ||
                hasInsufficientBalance
              }
            >
              {orderSubmitting
                ? "Creating..."
                : "Create order"}
            </Button>

          </div>

        </form>

      </Modal>

    </main>
  );
}