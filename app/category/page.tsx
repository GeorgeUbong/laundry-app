"use client";

import { useEffect, useState } from "react";
import {
  getCategories,
  Category,
} from "@/apis/userRoutes";
import LoadingC from "./loading";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setError("Your session has expired");
          return;
        }

        const data = await getCategories(token);

        setCategories(data.categories);
      } catch (err) {
        console.error("Failed to load categories:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load categories"
        );
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Loading
  if (loading) {
    return (
      <main>
        <LoadingC/>
      </main>
    );
  }

  // Error
  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Categories
        </h1>

        <p className="mt-2 text-gray-400">
          Manage your laundry categories and items.
        </p>
      </div>

      {/* Table */}
      <div className="table-enter overflow-hidden rounded-xl border border-gray-800 bg-gray-950">

        <div className="overflow-x-auto">
          <table className="w-full text-left">

            {/* Table Header */}
            <thead className="border-b border-gray-800 bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-300">
                  Category
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-300">
                  Item
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-300">
                  Price
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-300">
                  Item ID
                </th>

                {/**<th className="px-6 py-4 text-sm font-semibold text-gray-300">
                  Actions
                </th> */}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-800">

              {categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.flatMap((category) =>
                  category.items.map((item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-gray-900"
                    >

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="font-medium text-white">
                          {category.name}
                        </span>
                      </td>

                      {/* Item */}
                      <td className="px-6 py-4 text-gray-300">
                        {item.name}
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 font-medium text-green-400">
                        ₦{item.price.toLocaleString()}
                      </td>

                      {/* Item ID */}
                      <td className="px-6 py-4 text-gray-500">
                        #{item.id}
                      </td>

                      {/* Actions  <td className="px-6 py-4">
                        <div className="flex gap-2">

                          <button
                            className="rounded-lg px-3 py-2 text-sm text-blue-400 hover:bg-blue-500/10"
                          >
                            Edit
                          </button>

                          <button
                            className="rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                          >
                            Delete
                          </button>

                        </div>
                      </td> */}
                     

                    </tr>
                  ))
                )
              )}

            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}