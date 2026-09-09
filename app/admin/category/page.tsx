"use client";

import { useEffect, useState } from "react";
import { MoreVertical, Plus } from "lucide-react";

import {
  Category,
  getCategories,
  getStats,
  addCategory,
  updateCategory,
  deleteCategory,
} from "@/apis/adminRoutes";

import { toast } from "react-toastify";
import Loading from "@/category/loading";

type DashboardStats = {
  categories: number;
  customers: number;
  income: number;
  orders: number;
};

export default function CategoriesTable() {
  const [categories, setCategories] = useState<Category[]>([]);

  const [stats, setStats] = useState<DashboardStats>({
    categories: 0,
    customers: 0,
    income: 0,
    orders: 0,
  });

  const [loading, setLoading] = useState(true);

  // Add Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null);

  const [editName, setEditName] = useState("");

  // ================= LOAD =================

  const loadCategories = async () => {
    try {
      const token = localStorage.getItem("token2");

      if (!token) return;

      const [categoriesData, statsData] = await Promise.all([
        getCategories(token),
        getStats(token),
      ]);

      setCategories(categoriesData);
      setStats(statsData.dashboardData);
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // ================= ADD =================

  const handleAddCategory = async () => {
    try {
      const token = localStorage.getItem("token2");

      if (!token) return;

      if (!newCategoryName.trim()) {
        toast.error("Category name is required");
        return;
      }

      const newCategory = await addCategory(
        token,
        newCategoryName.trim()
      );

      setCategories((prev) => [
        ...prev,
        {
          ...newCategory,
          items: [],
        },
      ]);

      toast.success("Category created");

      setShowAddModal(false);
      setNewCategoryName("");

      // Refresh stats
      const statsData = await getStats(token);
      setStats(statsData.dashboardData);
    } catch {
      toast.error("Failed to create category");
    }
  };

  // ================= EDIT =================

  const openEdit = (category: Category) => {
    setSelectedCategory(category);
    setEditName(category.name);
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token2");

      if (!token || !selectedCategory) return;

      if (!editName.trim()) {
        toast.error("Category name is required");
        return;
      }

      await updateCategory(
        token,
        selectedCategory.id,
        editName.trim()
      );

      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === selectedCategory.id
            ? { ...cat, name: editName.trim() }
            : cat
        )
      );

      toast.success("Category updated");

      setShowEditModal(false);
    } catch {
      toast.error("Update failed");
    }
  };

  // ================= DELETE =================

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token2");

      if (!token || !selectedCategory) return;

      await deleteCategory(token, selectedCategory.id);

      setCategories((prev) =>
        prev.filter((cat) => cat.id !== selectedCategory.id)
      );

      toast.success("Category deleted");

      setShowEditModal(false);
      setSelectedCategory(null);
      setEditName("");

      // Refresh stats
      const statsData = await getStats(token);
      setStats(statsData.dashboardData);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to delete category";

      toast.error(message);
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
    <main className="page-enter min-h-screen space-y-6 bg-black p-4 text-white sm:p-6">

      {/* ================= HEADER ================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Categories
          </h1>

          <p className="text-gray-400">
            Manage laundry categories
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-white transition hover:bg-brand-hover sm:w-auto"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {/* ================= STATS ================= */}

      <div className="stagger-grid grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">

        {/* Customers */}

        <div className="min-w-0 rounded-xl border border-gray-800 bg-gray-900 p-4 sm:p-6">
          <p className="text-sm text-gray-400">
            Customers
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {stats.customers.toLocaleString()}
          </p>
        </div>

        {/* Orders */}

        <div className="min-w-0 rounded-xl border border-gray-800 bg-gray-900 p-4 sm:p-6">
          <p className="text-sm text-gray-400">
            Orders
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {stats.orders.toLocaleString()}
          </p>
        </div>

        {/* Categories */}

        <div className="min-w-0 rounded-xl border border-gray-800 bg-gray-900 p-4 sm:p-6">
          <p className="text-sm text-gray-400">
            Categories
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {stats.categories.toLocaleString()}
          </p>
        </div>

        {/* Income */}

        <div className="min-w-0 rounded-xl border border-gray-800 bg-gray-900 p-4 sm:p-6">
          <p className="text-sm text-gray-400">
            Income
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            ₦{stats.income.toLocaleString()}
          </p>
        </div>

      </div>

      {/* ================= TABLE ================= */}

      <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900">

        <table className="w-full min-w-max">

          <thead className="bg-gray-900">

            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                ID
              </th>

              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                Name
              </th>

              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                Items
              </th>

              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                Created
              </th>

              <th className="px-6 py-4 text-center text-sm font-medium text-gray-400">
                Actions
              </th>
            </tr>

          </thead>

          <tbody>

            {categories.length === 0 ? (

              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-gray-400"
                >
                  No categories found
                </td>
              </tr>

            ) : (

              categories.map((category) => (

                <tr
                  key={category.id}
                  className="border-t border-gray-800"
                >

                  <td className="p-4">
                    {category.id}
                  </td>

                  <td className="p-4">
                    {category.name}
                  </td>

                  <td className="p-4">
                    {category?.items?.length ?? 0}
                  </td>

                  <td className="p-4">
                    {new Date(
                      category.createdAt
                    ).toLocaleDateString()}
                  </td>

                  <td className="p-4 text-center">

                    <button
                      onClick={() => openEdit(category)}
                      className="rounded-lg p-2 hover:bg-gray-800"
                    >
                      <MoreVertical size={18} />
                    </button>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      {/* ================= ADD MODAL ================= */}

      {showAddModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">

          <div className="w-full max-w-100 rounded-xl border border-gray-800 bg-gray-900 p-5 shadow-xl sm:p-6">

            <h2 className="mb-4 text-xl font-semibold">
              Add Category
            </h2>

            <input
              value={newCategoryName}
              onChange={(e) =>
                setNewCategoryName(e.target.value)
              }
              placeholder="Category Name"
              className="w-full rounded-lg border border-gray-700 bg-black p-3 text-white outline-none focus:border-blue-500"
            />

            <div className="mt-6 flex gap-3">

              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewCategoryName("");
                }}
                className="flex-1 rounded-lg border border-gray-700 p-3"
              >
                Cancel
              </button>

              <button
                onClick={handleAddCategory}
                className="flex-1 rounded-lg bg-blue-600 p-3 text-white hover:bg-blue-700"
              >
                Save
              </button>

            </div>

          </div>

        </div>

      )}

      {/* ================= EDIT MODAL ================= */}

      {showEditModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">

          <div className="w-full max-w-100 rounded-xl border border-gray-800 bg-gray-900 p-5 shadow-xl sm:p-6">

            <h2 className="mb-4 text-xl font-semibold">
              Edit Category
            </h2>

            <input
              value={editName}
              onChange={(e) =>
                setEditName(e.target.value)
              }
              className="w-full rounded-lg border border-gray-700 bg-black p-3 text-white outline-none focus:border-blue-500"
            />

            <div className="mt-6 flex gap-3">

              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCategory(null);
                }}
                className="flex-1 rounded-lg border border-gray-700 p-3"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="flex-1 rounded-lg bg-red-600 p-3 text-white hover:bg-red-700"
              >
                Delete
              </button>

              <button
                onClick={handleUpdate}
                className="flex-1 rounded-lg bg-blue-600 p-3 text-white hover:bg-blue-700"
              >
                Save
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}