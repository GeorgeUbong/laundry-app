"use client";

import { useEffect, useState } from "react";
import {
  getStats,
  getCustomers,
  Customer,
  addCustomer,
  addOrder
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

  const [formData, setFormData] = useState({
    username: "",
    phonenumber: "",
    balance: 0,
  });

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

        // Get stats and customers at the same time
        const [statsData, customersData] = await Promise.all([
          getStats(token),
          getCustomers(token),
        ]);

        console.log("Stats received:", statsData);
        console.log("Customers received:", customersData);

        // Store dashboard statistics
        setStats(statsData.dashboardData);

        // Store customers
        setCustomers(customersData.getCustomer);
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
        setCustomers((currentCustomers) => [data.customer!, ...currentCustomers]);
        setStats((currentStats) => ({
          ...currentStats,
          customers: currentStats.customers + 1,
        }));
      }

      setFormData({ username: "", phonenumber: "", balance: 0 });
      setIsModalOpen(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to add customer");
    }
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
    <main className="min-w-0 p-4 sm:p-6 lg:p-8">
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

        <Button>
          Create Order
        </Button>
      </div>

         {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"> 
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

             <h2 className="mt-2 text-3xl font-bold">
            {stats.orders}
          </h2>
          </p>
          </div>

        </div>
          

        
        {/* ================= CUSTOMERS TABLE ================= */}
      <div className="mt-8 min-w-0 rounded-xl border border-gray-800 bg-gray-900">

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
          <table className="min-w-[40rem] w-full text-left text-sm">

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
                  Created
                </th>
              </tr>
            </thead>

            <tbody>
              {customers.length > 0 ? (
                customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50"
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

                    <td className="px-6 py-4 text-gray-400">
                      {new Date(
                        customer.createdAt
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
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

      {/**MODAL ADD ORDER */}
    </main>
  )
}