"use client";

import { useEffect, useState } from "react";
import {
  getCustomers,
  getCustomer,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  adjustCustomerBalance,
} from "../../api/employee/routes";
import Loading from "./loading";
import Modal from "../_components/modal";

type Customer = {
  id?: string | number;
  name?: string;
  username?: string;
  phonenumber?: string;
  email?: string;
  balance?: number;
  createdAt?: string;
};

type CustomerForm = {
  username: string;
  phonenumber: string;
  balance: string;
};

function normalizeCustomer(data: unknown): Customer {
  if (!data || typeof data !== "object") {
    return {};
  }

  const customer = data as Customer;
  return {
    ...customer,
    name: customer.name ?? customer.username,
  };
}

function normalizeCustomers(data: unknown): Customer[] {
  if (Array.isArray(data)) {
    return data.map(normalizeCustomer);
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const response = data as Record<string, unknown>;
  const nestedCustomers = response.customers ?? response.data;

  if (Array.isArray(nestedCustomers)) {
    return nestedCustomers.map(normalizeCustomer);
  }

  if (nestedCustomers && typeof nestedCustomers === "object") {
    return normalizeCustomers(nestedCustomers);
  }

  return Object.values(response)
    .filter(
      (value) =>
        value &&
        typeof value === "object" &&
        ("id" in value || "username" in value || "name" in value)
    )
    .map(normalizeCustomer);
}

function unwrapCustomer(data: unknown): Customer {
  if (!data || typeof data !== "object") {
    return {};
  }

  const response = data as Record<string, unknown>;
  return normalizeCustomer(response.customer ?? response.data ?? data);
}

export default function CustomersPage() {
  const [customers, SetCustomers] = useState<Customer[]>([]);
  const [loading, SetLoading] = useState(true);
  const [error, SetError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [customerForm, setCustomerForm] = useState<CustomerForm>({
    username: "",
    phonenumber: "",
    balance: "0",
  });

  //load customers
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        SetLoading(true);
        const data = await getCustomers();
        SetCustomers(normalizeCustomers(data));
      } catch (err) {
        SetError(err instanceof Error ? err.message : "Failed to load customers");
      } finally {
        SetLoading(false);
      }
    }
    loadCustomers();
  }, []);

  //Add a customer
  const handleAddCustomer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newCustomer = {
      username: customerForm.username.trim(),
      phonenumber: customerForm.phonenumber.trim(),
      balance: Number(customerForm.balance) || 0,
    }
    try {
      setIsAddingCustomer(true);
      const added = await addCustomer(newCustomer);
      SetCustomers((currentCustomers) => [
        ...currentCustomers,
        unwrapCustomer(added),
      ]);
      setCustomerForm({ username: "", phonenumber: "", balance: "0" });
      setIsAddModalOpen(false);
      SetError(null);
    } catch (err) {
      SetError(err instanceof Error ? err.message : "Failed to add customer");
    } finally {
      setIsAddingCustomer(false);
    }
  };

  const openAddCustomerModal = () => {
    SetError(null);
    setIsAddModalOpen(true);
  };

  //delete customer 
  const handleDeleteCustomer = async (id: string) => {
    try {
      await deleteCustomer(id);
      SetCustomers((currentCustomers) =>
        currentCustomers.filter((customer) => customer.id !== id)
      );
      SetError(null);
    } catch (err) {
      SetError("Failed to delete customer");
    }
  };

  //get customer
  const handleGetCustomer = async (id: string) => {
    try {
      const customer = await getCustomer(id);
      setSelectedCustomer(unwrapCustomer(customer));
      SetError(null);
    } catch (err) {
      SetError("Failed to fetch customer details");
    }
  };

  //update customer
  const handleUpdateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const updated = await updateCustomer(id, updates);
      const normalizedCustomer = unwrapCustomer(updated);
      SetCustomers((currentCustomers) =>
        currentCustomers.map((customer) =>
          customer.id === id ? normalizedCustomer : customer
        )
      );
      setSelectedCustomer(null);
      SetError(null);
    } catch (err) {
      SetError("Failed to update customer");
    }
  };

  //Adjust balance
  const handleAdjustBalance = async (id: string, amount: number) => {
    try {
      const updated = await adjustCustomerBalance(id, { amount });
      const normalizedCustomer = unwrapCustomer(updated);
      SetCustomers((currentCustomers) =>
        currentCustomers.map((customer) =>
          customer.id === id ? normalizedCustomer : customer
        )
      );
      SetError(null);
    } catch (err) {
      SetError("Failed to adjust balance");
    }
  };

  if (loading) return <div><Loading /></div>

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Customers
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your customers and their account balances.
          </p>
        </div>

        <button
          onClick={openAddCustomerModal}
          className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          + Add Customer
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Total customers */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Customers
              </p>

              <h3 className="mt-2 text-3xl font-bold text-gray-900">
                {customers.length}
              </h3>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-xl">
              👥
            </div>
          </div>
        </div>

        {/* Customers with positive balance */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                With Positive Balance
              </p>

              <h3 className="mt-2 text-3xl font-bold text-gray-900">
                {customers.filter(
                  (customer) => (customer.balance ?? 0) > 0
                ).length}
              </h3>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl">
              💰
            </div>
          </div>
        </div>

        {/* Total balance */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Balance
              </p>

              <h3 className="mt-2 text-3xl font-bold text-gray-900">
                ₦
                {customers
                  .reduce(
                    (total, customer) =>
                      total + (customer.balance ?? 0),
                    0
                  )
                  .toLocaleString()}
              </h3>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-xl">
              💳
            </div>
          </div>
        </div>
      </div>

      {/* Customer table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Table header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Customer List
            </h2>

            <p className="text-sm text-gray-500">
              All registered customers
            </p>
          </div>

          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
            {customers.length} customers
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Customer
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Phone Number
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Balance
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Created
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {customers.map((customer, index) => (
                <tr
                  key={
                    customer.id ??
                    `${customer.username ?? customer.name ?? "customer"}-${
                      customer.phonenumber ?? "unknown"
                    }-${index}`
                  }
                  className="transition hover:bg-gray-50"
                >
                  {/* Customer */}
                  <td className="whitespace-nowrap px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
                        {customer.name
                          ?.charAt(0)
                          .toUpperCase() || "C"}
                      </div>

                      <div>
                        <p className="font-medium text-gray-900">
                          {customer.name || "Unknown Customer"}
                        </p>

                        <p className="text-xs text-gray-400">
                          ID: {customer.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="whitespace-nowrap px-6 py-5 text-sm text-gray-600">
                    {customer.phonenumber || "N/A"}
                  </td>

                  {/* Balance */}
                  <td className="whitespace-nowrap px-6 py-5">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        (customer.balance ?? 0) > 0
                          ? "bg-green-100 text-green-700"
                          : (customer.balance ?? 0) < 0
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      ₦{(customer.balance ?? 0).toLocaleString()}
                    </span>
                  </td>

                  {/* Created */}
                  <td className="whitespace-nowrap px-6 py-5 text-sm text-gray-500">
                    {customer.createdAt
                      ? new Date(
                          customer.createdAt
                        ).toLocaleDateString()
                      : "N/A"}
                  </td>

                  {/* Actions */}
                  <td className="whitespace-nowrap px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() =>
                          customer.id &&
                          handleGetCustomer(String(customer.id))
                        }
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                      >
                        View
                      </button>

                      <button
                        onClick={() =>
                          customer.id &&
                          handleUpdateCustomer(String(customer.id), {
                            name: customer.name,
                            phonenumber: customer.phonenumber,
                          })
                        }
                        className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          customer.id &&
                          handleDeleteCustomer(String(customer.id))
                        }
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
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
        {customers.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl">
              👥
            </div>

            <h3 className="text-lg font-semibold text-gray-900">
              No customers found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Add a customer to see them appear here.
            </p>

            <button
              onClick={openAddCustomerModal}
              className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Add Customer
            </button>
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <Modal
          title="Add Customer"
          onClose={() => setIsAddModalOpen(false)}
        >
          <form onSubmit={handleAddCustomer} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Username
              <input
                required
                value={customerForm.username}
                onChange={(event) =>
                  setCustomerForm((form) => ({
                    ...form,
                    username: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Customer username"
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Phone number
              <input
                required
                type="tel"
                value={customerForm.phonenumber}
                onChange={(event) =>
                  setCustomerForm((form) => ({
                    ...form,
                    phonenumber: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="08012345678"
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Balance
              <input
                type="number"
                min="0"
                step="0.01"
                value={customerForm.balance}
                onChange={(event) =>
                  setCustomerForm((form) => ({
                    ...form,
                    balance: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAddingCustomer}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAddingCustomer ? "Adding..." : "Add customer"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900">
              {selectedCustomer.name}
            </h2>
            <div className="mt-4 space-y-3">
              <p className="text-sm text-gray-600">
                <strong>ID:</strong> {selectedCustomer.id}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Phone:</strong> {selectedCustomer.phonenumber || "N/A"}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Balance:</strong> ₦{(selectedCustomer.balance ?? 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Created:</strong> {selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}