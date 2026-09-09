"use client";

import { useEffect, useState } from "react";
import {
  MoreVertical,
  Plus,
  Package
} from "lucide-react";

import {
  Category,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory
} from "@/apis/adminRoutes";

import { toast } from "react-toastify";
import Loading from "@/category/loading";

export default function CategoriesTable() {

  const [categories, setCategories] = useState<Category[]>([]);

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

      const data = await getCategories(token);

      setCategories(data);
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

      const newCategory = await addCategory(
        token,
        newCategoryName
      );

      setCategories(prev => [...prev, {
        ...newCategory,
        items: [],
      }]);

      toast.success("Category created");

      setShowAddModal(false);
      setNewCategoryName("");

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

      await updateCategory(
        token,
        selectedCategory.id,
        editName
      );

      setCategories(prev =>
        prev.map(cat =>
          cat.id === selectedCategory.id
            ? { ...cat, name: editName }
            : cat
        )
      );

      toast.success("Category updated");

      setShowEditModal(false);

    } catch {
      toast.error("Update failed");
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token2");

      if (!token || !selectedCategory) return;

      await deleteCategory(token, selectedCategory.id);

      setCategories(prev =>
        prev.filter(cat => cat.id !== selectedCategory.id)
      );

      toast.success("Category deleted");

      setShowEditModal(false);
      setSelectedCategory(null);
      setEditName("");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to delete category";

      toast.error(message);
    }
  };

  if (loading) {
    return <main><Loading/></main>;
  }

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold">
            Categories
          </h1>

          <p className="text-gray-400">
            Manage laundry categories
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2"
        >
          <Plus size={18} />
          Add Category
        </button>

      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-xl border border-gray-800">

        <table className="w-full">

          <thead className="bg-gray-900">

            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Items</th>
              <th className="p-4 text-left">Created</th>
              <th className="p-4 text-center">Actions</th>
            </tr>

          </thead>

          <tbody>

            {categories.map(category => (

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
                  {category?.items?.length}
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

            ))}

          </tbody>

        </table>
      </div>

      {/* ADD MODAL */}

      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70">

          <div className="w-[400px] rounded-xl bg-gray-900 p-6">

            <h2 className="mb-4 text-xl">
              Add Category
            </h2>

            <input
              value={newCategoryName}
              onChange={(e) =>
                setNewCategoryName(e.target.value)
              }
              placeholder="Category Name"
              className="w-full rounded-lg border border-gray-700 bg-black p-3"
            />

            <div className="mt-6 flex gap-3">

              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 rounded-lg border border-gray-700 p-3"
              >
                Cancel
              </button>

              <button
                onClick={handleAddCategory}
                className="flex-1 rounded-lg bg-blue-600 p-3"
              >
                Save
              </button>

            </div>

          </div>

        </div>
      )}

      {/* EDIT MODAL */}

      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70">

          <div className="w-[400px] rounded-xl bg-gray-900 p-6">

            <h2 className="mb-4 text-xl">
              Edit Category
            </h2>

            <input
              value={editName}
              onChange={(e) =>
                setEditName(e.target.value)
              }
              className="w-full rounded-lg border border-gray-700 bg-black p-3"
            />

            <div className="mt-6 flex gap-3">

              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 rounded-lg border border-gray-700 p-3"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="flex-1 rounded-lg bg-red-600 p-3"
              >
                Delete
              </button>

              <button
                onClick={handleUpdate}
                className="flex-1 rounded-lg bg-blue-600 p-3"
              >
                Save
              </button>

            </div>

          </div>

        </div>
      )}
    </div>
  );
}