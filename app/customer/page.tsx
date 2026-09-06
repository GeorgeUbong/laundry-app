"use client";

import { useCallback, useEffect, useState } from "react";
import { MoreVertical, ArrowRight, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import {
  getStats,
  getCustomers,
  Customer,
  addCustomer,
  addOrder,
  getCategories,
  Category,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  deleteOrder,
  updateOrderStatus,
  completeOrder,
  addCustomerBalance,
  Customer as CustomerType,
} from "@/apis/userRoutes";

import { Button } from "@/_components/button";
import { Modal } from "@/_components/modal";
import Loading from "./loading";

type DashboardStats = {
  categories: number;
  customers: number;
  income: number;
  orders: number;
};

type OrderFilter = "all" | "pending" | "ready";

export default function CustomerPage() {
  const [stats, setStats] = useState<DashboardStats>({
    categories: 0,
    customers: 0,
    income: 0,
    orders: 0,
  });

  const [customers, setCustomers] = useState<Customer[]>([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [customerOrderLocked, setCustomerOrderLocked] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("all");
  const [customerSearch, setCustomerSearch] = useState("");
  const [orderForm, setOrderForm] = useState({
    customerId: "",
    itemId: "",
    quantity: 1,
  });
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerType | null>(null);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);
  const [customerActionLoading, setCustomerActionLoading] = useState(false);
  const [balanceSubmitting, setBalanceSubmitting] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<CustomerType["order"][number] | null>(null);
  const [orderActionLoading, setOrderActionLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState("completed");
  const [pendingOrderAction, setPendingOrderAction] = useState<"status" | "delete" | null>(null);
  const [deleteCustomerPrompt, setDeleteCustomerPrompt] = useState(false);
  const [editCustomerForm, setEditCustomerForm] = useState({
    username: "",
    phonenumber: "",
  });
  const [refreshingCustomer, setRefreshingCustomer] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    phonenumber: "",
    balance: 0,
  });

  const loadPageData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Your session has expired");

      const [statsData, customersData, categoriesData] = await Promise.all([
        getStats(token),
        getCustomers(token),
        getCategories(token),
      ]);

      setStats(statsData.dashboardData);
      setCustomers(customersData.getCustomer);
      setCategories(categoriesData.categories);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load customers";
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

  // ✅ NEW: Refresh customer data in sidebar
  const refreshCustomerData = async () => {
    if (!selectedCustomer) return;
    try {
      setRefreshingCustomer(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Your session has expired");
      
      const data = await getCustomer(selectedCustomer.id, token);
      setSelectedCustomer(data.customer);
      toast.success("Customer updated");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to refresh customer";
      toast.error(message);
    } finally {
      setRefreshingCustomer(false);
    }
  };

  const openCustomerOrder = () => {
    if (!selectedCustomer) return;
    setOrderForm((currentForm) => ({
      ...currentForm,
      customerId: String(selectedCustomer.id),
    }));
    setCustomerSearch(selectedCustomer.username);
    setCustomerOrderLocked(true);
    setIsOrderModalOpen(true);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPageData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadPageData]);

  //add customer
   const handleAddCustomer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Your session has expired");
      }

      const data = await addCustomer(formData, token);

      if (data.customer) {
        setCustomers((currentCustomers) => [
          { ...data.customer!, order: data.customer!.order ?? [] },
          ...currentCustomers,
        ]);
        setStats((currentStats) => ({
          ...currentStats,
          customers: currentStats.customers + 1,
        }));
      }

      setFormData({ username: "", phonenumber: "", balance: 0 });
      setIsModalOpen(false);
      await refreshPage("Customer added");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add customer";
      toast.error(message);
      setError(message);
    }
  };

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
  const visibleCustomers = customers.filter((customer) =>
    orderFilter === "all"
      ? true
      : customer.order.some(
          (order) => order.status.toLowerCase() === orderFilter
        )
  );

  const handleCreateOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Your session has expired");
      if (hasInsufficientBalance) {
        toast.error("Order total exceeds the customer balance");
        return;
      }

      setOrderSubmitting(true);
      const data = await addOrder(
        {
          customerId: Number(orderForm.customerId),
          items: [{ itemId: Number(orderForm.itemId), quantity: orderForm.quantity }],
        },
        token
      );

      setCustomers((currentCustomers) =>
        currentCustomers.map((customer) =>
          customer.id === data.order.customerId
            ? { ...customer, order: [data.order, ...customer.order] }
            : customer
        )
      );
      setStats((currentStats) => ({
        ...currentStats,
        orders: currentStats.orders + 1,
      }));
      setOrderForm({ customerId: "", itemId: "", quantity: 1 });
      setCustomerSearch("");
      setCustomerOrderLocked(false);
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

  const handleCustomerClick = async (customerId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Your session has expired");

      setCustomerLoading(true);
      const data = await getCustomer(customerId, token);
      setSelectedCustomer(data.customer);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load customer";
      toast.error(message);
      setError(message);
    } finally {
      setCustomerLoading(false);
    }
  };

  const openCustomerEdit = () => {
    if (!selectedCustomer) return;
    setEditCustomerForm({
      username: selectedCustomer.username,
      phonenumber: selectedCustomer.phonenumber,
    });
    setIsEditCustomerOpen(true);
  };

  const handleUpdateCustomer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCustomer) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Your session has expired");

      setCustomerActionLoading(true);
      await updateCustomer(
        selectedCustomer.id,
        editCustomerForm.username,
        editCustomerForm.phonenumber,
        token
      );
      setIsEditCustomerOpen(false);
      await refreshPage("Customer updated");
      const refreshedCustomer = await getCustomer(selectedCustomer.id, token);
      setSelectedCustomer(refreshedCustomer.customer);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update customer";
      toast.error(message);
      setError(message);
    } finally {
      setCustomerActionLoading(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Your session has expired");

      setCustomerActionLoading(true);
      await deleteCustomer(selectedCustomer.id, token);
      setCustomers((currentCustomers) =>
        currentCustomers.filter((customer) => customer.id !== selectedCustomer.id)
      );
      setStats((currentStats) => ({
        ...currentStats,
        customers: Math.max(0, currentStats.customers - 1),
      }));
      setSelectedCustomer(null);
      setDeleteCustomerPrompt(false);
      await refreshPage("Customer deleted");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete customer";
      toast.error(message);
      setError(message);
    } finally {
      setCustomerActionLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!selectedCustomer) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Your session has expired");

      await deleteOrder(orderId, token);
      setSelectedCustomer((currentCustomer) =>
        currentCustomer
          ? {
              ...currentCustomer,
              order: currentCustomer.order.filter((order) => order.id !== orderId),
            }
          : currentCustomer
      );
      setCustomers((currentCustomers) =>
        currentCustomers.map((customer) =>
          customer.id === selectedCustomer.id
            ? {
                ...customer,
                order: customer.order.filter((order) => order.id !== orderId),
              }
            : customer
        )
      );
      setStats((currentStats) => ({
        ...currentStats,
        orders: Math.max(0, currentStats.orders - 1),
      }));
      setSelectedOrder(null);
      setPendingOrderAction(null);
      await refreshPage("Order deleted");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete order";
      toast.error(message);
      setError(message);
    }
  };

  const updateSelectedOrder = (updatedOrder: CustomerType["order"][number]) => {
    setSelectedCustomer((currentCustomer) =>
      currentCustomer
        ? {
            ...currentCustomer,
            order: currentCustomer.order.map((order) =>
              order.id === updatedOrder.id ? updatedOrder : order
            ),
          }
        : currentCustomer
    );
    setCustomers((currentCustomers) =>
      currentCustomers.map((customer) =>
        customer.id === selectedCustomer?.id
          ? {
              ...customer,
              order: customer.order.map((order) =>
                order.id === updatedOrder.id ? updatedOrder : order
              ),
            }
          : customer
      )
    );
  };

  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder || !selectedCustomer) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Your session has expired");

      setOrderActionLoading(true);
      const customerId = selectedCustomer.id;

      // ✅ Changed: orderStatus is now "completed" instead of "ready"
      if (orderStatus === "completed") {
        const completion = await completeOrder(selectedOrder.id, token);

        // ✅ FIXED: Update order status AND customer balance
        setSelectedCustomer((currentCustomer) =>
          currentCustomer && currentCustomer.id === customerId
            ? {
                ...currentCustomer,
                ...completion.updatedCustomer,
                // ✅ Update the order with new status from API
                order: currentCustomer.order.map((order) =>
                  order.id === selectedOrder.id
                    ? { ...order, ...completion.updatedOrder }
                    : order
                ),
              }
            : currentCustomer
        );
      } else {
        const statusUpdate = await updateOrderStatus(
          selectedOrder.id,
          { status: orderStatus },
          token
        );
        updateSelectedOrder({
          ...statusUpdate.order,
          items: statusUpdate.order.items ?? [],
        });
      }

      setSelectedOrder(null);
      setPendingOrderAction(null);
      await refreshPage(orderStatus === "completed" ? "Order completed successfully" : "Order status updated");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update order";
      toast.error(message);
      setError(message);
    } finally {
      setOrderActionLoading(false);
    }
  };

  const handleAddBalance = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCustomer || balanceAmount <= 0) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Your session has expired");

      setBalanceSubmitting(true);
      await addCustomerBalance(selectedCustomer.id, balanceAmount, token);
      setBalanceAmount(0);
      setIsBalanceModalOpen(false);
      await refreshPage("Customer balance updated");
      const refreshedCustomer = await getCustomer(selectedCustomer.id, token);
      setSelectedCustomer(refreshedCustomer.customer);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add balance";
      toast.error(message);
      setError(message);
    } finally {
      setBalanceSubmitting(false);
    }
  };

  const handleOrderActionConfirmation = async () => {
    if (pendingOrderAction === "status") {
      await handleUpdateOrderStatus();
    } else if (pendingOrderAction === "delete" && selectedOrder) {
      await handleDeleteOrder(selectedOrder.id);
    }
  };

  // ✅ NEW: Split orders into active and history
  const getOrdersByStatus = (customer: CustomerType) => {
    const active = customer.order.filter(
      (order) => order.status.toLowerCase() !== "completed"
    );
    const history = customer.order.filter(
      (order) => order.status.toLowerCase() === "completed"
    );
    return { active, history };
  };



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
    <main className="page-enter min-w-0 p-4 sm:p-6 lg:p-8">
         {/* Header */}
      <h1 className="mb-2 text-2xl font-bold sm:text-3xl">
        Customers
      </h1>

      <h3 className="mb-6 text-base text-gray-300 sm:text-xl">
        View customers and create laundry orders
      </h3>
     {/* ================= BUTTON ================= */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Button onClick={() => setIsModalOpen(true)}>
          Add customer
        </Button>

        <Button
          onClick={() => {
            setCustomerOrderLocked(false);
            setIsOrderModalOpen(true);
          }}
        >
          Create Order
        </Button>
      </div>

         {/* ================= STATS ================= */}
      <div className="stagger-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"> 
        {/* Customers */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 sm:p-6">
          <p className="text-sm text-gray-400">
            Customers
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {stats.customers}
          </h2>
        </div>

        {/* Orders */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 sm:p-6">
          <p className="text-sm text-gray-400">
            Orders
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {stats.orders}
          </h2>
        </div>

      </div>
          

        
        {/* ================= CUSTOMERS TABLE ================= */}
      <div className="table-enter mt-8">
        
        {/* ===== FILTERS SECTION (MOVED ABOVE TABLE) ===== */}
        <div className="mb-4 flex flex-wrap gap-2">
          {(["all", "pending", "ready"] as OrderFilter[]).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setOrderFilter(filter)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${
                orderFilter === filter
                  ? "bg-brand-primary text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
 
        {/* ===== TABLE CONTAINER ===== */}
        <div className="rounded-xl border border-gray-800 bg-gray-900">
 
          {/* Table Header */}
          <div className="border-b border-gray-800 p-4 sm:p-6">
            <h2 className="text-lg font-semibold sm:text-xl">
              Customers
            </h2>
 
            <p className="mt-1 text-sm text-gray-400">
              Recent customers
            </p>
          </div>
 
          {/* Responsive table */}
          <div className="overflow-x-auto">
            <table className="min-w-160 w-full text-left text-sm">
 
              <thead className="border-b border-gray-800 text-gray-400">
                <tr>
                  <th className="px-6 py-4">
                    ID
                  </th>
 
                  <th className="px-6 py-4">
                    Username
                  </th>
 
                  <th className="px-6 py-4">
                    Phone Number
                  </th>
 
                  <th className="px-6 py-4">
                    Balance
                  </th>
 
                  <th className="px-6 py-4">
                    Orders
                  </th>

                  <th className="px-6 py-4">
                    Actions
                  </th>
                </tr>
              </thead>
 
              <tbody>
                {visibleCustomers.length > 0 ? (
                  visibleCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition"
                    >
                      <td className="px-6 py-4">
                        {customer.id}
                      </td>
 
                      <td className="px-6 py-4 font-medium">
                        {customer.username}
                      </td>
 
                      <td className="px-6 py-4 text-gray-300">
                        {customer.phonenumber}
                      </td>
 
                      <td className="px-6 py-4">
                        ₦{customer.balance.toLocaleString()}
                      </td>
 
                      <td className="px-6 py-4 text-gray-300">
                        {customer.order.length}
                      </td>

                      {/* ===== ACTIONS COLUMN ===== */}
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleCustomerClick(customer.id)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white transition"
                          aria-label={`Open details for customer ${customer.username}`}
                        >
                          <ArrowRight className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      No customers found
                    </td>
                  </tr>
                )}
              </tbody>
 
            </table>
          </div>
        </div>
      </div>


      {/** Modal FOR ADD CUSTOMER*/}
       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleAddCustomer} className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Add customer</h2>
            <p className="mt-1 text-sm text-gray-400">
              Enter the customer details below.
            </p>
          </div>

          <label className="block text-sm font-medium">
            Username
            <input
              required
              value={formData.username}
              onChange={(event) =>
                setFormData({ ...formData, username: event.target.value })
              }
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-white outline-none focus:border-green-500"
            />
          </label>

          <label className="block text-sm font-medium">
            Phone number
            <input
              required
              value={formData.phonenumber}
              onChange={(event) =>
                setFormData({ ...formData, phonenumber: event.target.value })
              }
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-white outline-none focus:border-green-500"
            />
          </label>

          <label className="block text-sm font-medium">
            Balance
            <input
              required
              min="0"
              type="number"
              value={formData.balance}
              onChange={(event) =>
                setFormData({ ...formData, balance: Number(event.target.value) })
              }
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-white outline-none focus:border-green-500"
            />
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add customer</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
      >
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Create order</h2>
            <p className="mt-1 text-sm text-gray-400">
              Choose a customer, laundry item, and quantity.
            </p>
          </div>

          <label className="block text-sm font-medium">
            Customer
            <input
              required
              value={customerSearch}
              readOnly={customerOrderLocked}
              onChange={(event) => {
                setCustomerSearch(event.target.value);
                setOrderForm({ ...orderForm, customerId: "" });
              }}
              placeholder="Search by username or phone number"
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-white outline-none focus:border-green-500"
            />
            <select
              required
              value={orderForm.customerId}
              disabled={customerOrderLocked}
              onChange={(event) => {
                const customer = customers.find(
                  (item) => item.id === Number(event.target.value)
                );
                setOrderForm({ ...orderForm, customerId: event.target.value });
                setCustomerSearch(customer?.username ?? "");
              }}
              className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-white outline-none focus:border-green-500"
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
                setOrderForm({ ...orderForm, itemId: event.target.value })
              }
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-white outline-none focus:border-green-500"
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
                setOrderForm({
                  ...orderForm,
                  quantity: Math.max(1, Number(event.target.value)),
                })
              }
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-white outline-none focus:border-green-500"
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

      <Modal
        isOpen={isBalanceModalOpen}
        onClose={() => setIsBalanceModalOpen(false)}
      >
        <form onSubmit={handleAddBalance} className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold">Add balance</h2>
            <p className="mt-1 text-sm text-grey-surface">
              Add funds to {selectedCustomer?.username}&apos;s account.
            </p>
          </div>
          <label className="block text-sm font-medium">
            Amount
            <input
              required
              min="1"
              type="number"
              value={balanceAmount}
              onChange={(event) => setBalanceAmount(Number(event.target.value))}
              className="mt-2 w-full rounded-lg border border-card-border bg-app-bg px-3 py-2 text-app-text outline-none focus:border-brand-primary"
            />
          </label>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsBalanceModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={balanceSubmitting}>
              {balanceSubmitting ? "Adding..." : "Add balance"}
            </Button>
          </div>
        </form>
      </Modal>

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
                Current status:{" "}
                {/* ✅ FIXED: Changed color logic for completed status */}
                <span className={`rounded-full px-2 py-1 ${
                  selectedOrder.status.toLowerCase() === "completed" || selectedOrder.status.toLowerCase() === "ready"
                    ? "bg-green-500/15 text-green-400"
                    : "bg-orange-500/15 text-orange-400"
                }`}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </span>
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
                {/* ✅ Changed: "Ready" to "Completed" */}
                <option value="completed">Completed</option>
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

      {selectedCustomer && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setSelectedCustomer(null)}
          />
          <aside className="drawer-enter fixed right-0 top-0 z-50 h-full w-full max-w-xl overflow-y-auto border-l border-gray-800 bg-gray-950 p-6 text-white shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-gray-400">Customer details</p>
                <h2 className="mt-1 text-2xl font-bold">
                  {selectedCustomer.username}
                </h2>
              </div>
              <div className="flex gap-2">
                {/* ✅ NEW: Refresh button */}
                <button
                  type="button"
                  onClick={refreshCustomerData}
                  disabled={refreshingCustomer}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-50 transition"
                  aria-label="Refresh customer data"
                  title="Refresh"
                >
                  <RefreshCw className={`h-5 w-5 ${refreshingCustomer ? "animate-spin" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="rounded-lg px-3 py-2 text-gray-400 hover:bg-gray-800 hover:text-white"
                  aria-label="Close customer details"
                >
                  X
                </button>
              </div>
            </div>

            {customerLoading ? (
              <p className="text-gray-400">Loading customer...</p>
            ) : (
              <>
                {isEditCustomerOpen ? (
                  <form onSubmit={handleUpdateCustomer} className="space-y-4">
                    <label className="block text-sm font-medium">
                      Username
                      <input
                        required
                        value={editCustomerForm.username}
                        onChange={(event) =>
                          setEditCustomerForm({
                            ...editCustomerForm,
                            username: event.target.value,
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white outline-none focus:border-green-500"
                      />
                    </label>
                    <label className="block text-sm font-medium">
                      Phone number
                      <input
                        required
                        value={editCustomerForm.phonenumber}
                        onChange={(event) =>
                          setEditCustomerForm({
                            ...editCustomerForm,
                            phonenumber: event.target.value,
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white outline-none focus:border-green-500"
                      />
                    </label>
                    <div className="flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditCustomerOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={customerActionLoading}>
                        {customerActionLoading ? "Saving..." : "Save changes"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3 rounded-xl border border-gray-800 bg-gray-900 p-4">
                      <div>
                        <p className="text-xs text-gray-400">Phone</p>
                        <p className="mt-1">{selectedCustomer.phonenumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Balance</p>
                        <p className="mt-1">
                          ₦{selectedCustomer.balance.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Created</p>
                        <p className="mt-1">
                          {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Button size="sm" className="whitespace-nowrap" onClick={openCustomerEdit}>
                        Update customer
                      </Button>
                      <Button size="sm" className="whitespace-nowrap" onClick={openCustomerOrder}>
                        Create order
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="whitespace-nowrap"
                        onClick={() => setIsBalanceModalOpen(true)}
                      >
                        Add balance
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="whitespace-nowrap"
                        onClick={() => setDeleteCustomerPrompt(true)}
                        disabled={customerActionLoading}
                      >
                        Delete customer
                      </Button>
                    </div>

                    {/* ✅ NEW: Split into Active Orders and History */}
                    <div className="mt-8 space-y-8">
                      {/* Active Orders */}
                      <div>
                        <h3 className="text-lg font-semibold">Active Orders</h3>
                        <div className="mt-3 space-y-3">
                          {getOrdersByStatus(selectedCustomer).active.length > 0 ? (
                            getOrdersByStatus(selectedCustomer).active.map((order) => (
                              <div
                                key={order.id}
                                className="rounded-xl border border-gray-800 bg-gray-900 p-4"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="font-semibold">Order #{order.id}</p>
                                    <p className="mt-1 text-sm text-gray-400">
                                      <span className={`rounded-full px-2 py-1 ${
                                        order.status.toLowerCase() === "ready"
                                          ? "bg-green-500/15 text-green-400"
                                          : "bg-orange-500/15 text-orange-400"
                                      }`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                      </span>
                                      <span className="ml-2">
                                        · {new Date(order.createdAt).toLocaleDateString()}
                                      </span>
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setOrderStatus(order.status === "Completed" ? "completed" : "pending");
                                      setPendingOrderAction(null);
                                    }}
                                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
                                    aria-label={`Open actions for order ${order.id}`}
                                  >
                                    <MoreVertical className="h-5 w-5" />
                                  </button>
                                </div>
                                <div className="mt-3 space-y-1 text-sm text-gray-300">
                                  {(order.items ?? []).map((orderItem) => (
                                    <p key={orderItem.id}>
                                      {orderItem.item.name} x {orderItem.quantity}
                                    </p>
                                  ))}
                                </div>
                                <p className="mt-3 font-semibold text-green-400">
                                  ₦{(
                                    order.totalAmount ??
                                    (order.items ?? []).reduce(
                                      (total, orderItem) =>
                                        total + orderItem.price * orderItem.quantity,
                                      0
                                    )
                                  ).toLocaleString()}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-400">No active orders.</p>
                          )}
                        </div>
                      </div>

                      {/* History */}
                      <div>
                        <h3 className="text-lg font-semibold">History</h3>
                        <div className="mt-3 space-y-3">
                          {getOrdersByStatus(selectedCustomer).history.length > 0 ? (
                            getOrdersByStatus(selectedCustomer).history.map((order) => (
                              <div
                                key={order.id}
                                className="rounded-xl border border-gray-800 bg-gray-900 p-4 opacity-75"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="font-semibold">Order #{order.id}</p>
                                    <p className="mt-1 text-sm text-gray-400">
                                      <span className="rounded-full bg-green-500/15 px-2 py-1 text-green-400">
                                        Completed
                                      </span>
                                      <span className="ml-2">
                                        · {new Date(order.createdAt).toLocaleDateString()}
                                      </span>
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setOrderStatus("completed");
                                      setPendingOrderAction(null);
                                    }}
                                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
                                    aria-label={`Open actions for order ${order.id}`}
                                  >
                                    <MoreVertical className="h-5 w-5" />
                                  </button>
                                </div>
                                <div className="mt-3 space-y-1 text-sm text-gray-300">
                                  {(order.items ?? []).map((orderItem) => (
                                    <p key={orderItem.id}>
                                      {orderItem.item.name} x {orderItem.quantity}
                                    </p>
                                  ))}
                                </div>
                                <p className="mt-3 font-semibold text-green-400">
                                  ₦{(
                                    order.totalAmount ??
                                    (order.items ?? []).reduce(
                                      (total, orderItem) =>
                                        total + orderItem.price * orderItem.quantity,
                                      0
                                    )
                                  ).toLocaleString()}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-400">No completed orders.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </aside>
        </>
      )}

      <Modal
        isOpen={deleteCustomerPrompt}
        onClose={() => setDeleteCustomerPrompt(false)}
      >
        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-red-400">
              Destructive action
            </p>
            <h2 className="mt-2 text-xl font-semibold">Delete customer?</h2>
            <p className="mt-2 text-sm text-grey-surface">
              This will permanently remove {selectedCustomer?.username} and their customer record.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteCustomerPrompt(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteCustomer}
              disabled={customerActionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {customerActionLoading ? "Deleting..." : "Delete customer"}
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  )
}