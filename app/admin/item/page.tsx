"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  MoreVertical,
  Trash2,
  X,
  Pencil,
} from "lucide-react";

import { toast } from "react-toastify";

import {
  getItems,
  getCategories,
  addItem,
  updateItem,
  deleteItem,
  type Item,
  type Category,
} from "@/apis/adminRoutes";


export default function ItemsPage() {
  // ================= DATA =================

  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);


  // ================= ADD MODAL =================

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [itemName, setItemName] =
    useState("");

  const [itemPrice, setItemPrice] =
    useState("");

  const [selectedCategoryId, setSelectedCategoryId] =
    useState("");

  const [adding, setAdding] =
    useState(false);


  // ================= EDIT MODAL =================

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [selectedItem, setSelectedItem] =
    useState<Item | null>(null);

  const [editName, setEditName] =
    useState("");

  const [editPrice, setEditPrice] =
    useState("");

  const [editCategoryId, setEditCategoryId] =
    useState("");

  const [updating, setUpdating] =
    useState(false);


  // ================= DELETE =================

  const [deleteStep, setDeleteStep] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);


  // =========================================================
  // LOAD ITEMS + CATEGORIES
  // =========================================================

  const loadData = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("token2");

      if (!token) {
        toast.error(
          "Your session has expired. Please log in again."
        );
        return;
      }

      const [itemsData, categoriesData] =
        await Promise.all([
          getItems(token),
          getCategories(token),
        ]);

      setItems(itemsData);
      setCategories(categoriesData);

    } catch (error) {
      console.error(
        "Failed to load data:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load items"
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadData();
  }, []);


  // =========================================================
  // GET CATEGORY NAME
  // =========================================================

  const getCategoryName = (
    categoryId: number
  ) => {
    const category =
      categories.find(
        (cat) =>
          cat.id === categoryId
      );

    return category?.name || "Unknown";
  };


  // =========================================================
  // ADD ITEM
  // =========================================================

  const handleAddItem = async () => {
    try {
      const token =
        localStorage.getItem("token2");

      if (!token) {
        toast.error(
          "Your session has expired"
        );
        return;
      }

      if (!selectedCategoryId) {
        toast.error(
          "Please select a category"
        );
        return;
      }

      if (!itemName.trim()) {
        toast.error(
          "Item name cannot be empty"
        );
        return;
      }

      if (!itemPrice) {
        toast.error(
          "Please enter a price"
        );
        return;
      }

      const price = Number(itemPrice);

      if (
        Number.isNaN(price) ||
        price <= 0
      ) {
        toast.error(
          "Please enter a valid price"
        );
        return;
      }

      setAdding(true);

      const newItem = await addItem(
        token,
        Number(selectedCategoryId),
        itemName.trim(),
        price
      );

      setItems((prev) => [
        ...prev,
        newItem,
      ]);

      toast.success(
        "Item created successfully"
      );

      // Reset form

      setItemName("");
      setItemPrice("");
      setSelectedCategoryId("");

      setShowAddModal(false);

    } catch (error) {
      console.error(
        "Add item error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create item"
      );

    } finally {
      setAdding(false);
    }
  };


  // =========================================================
  // OPEN EDIT
  // =========================================================

  const openEdit = (item: Item) => {
    setSelectedItem(item);

    setEditName(item.name);
    setEditPrice(String(item.price));
    setEditCategoryId(
      String(item.categoryId)
    );

    // Make sure delete starts from step 1
    setDeleteStep(false);

    setShowEditModal(true);
  };


  // =========================================================
  // UPDATE ITEM
  // =========================================================

  const handleUpdate = async () => {
    try {
      const token =
        localStorage.getItem("token2");

      if (!token) {
        toast.error(
          "Your session has expired"
        );
        return;
      }

      if (!selectedItem) {
        toast.error(
          "No item selected"
        );
        return;
      }

      if (!editName.trim()) {
        toast.error(
          "Item name cannot be empty"
        );
        return;
      }

      if (!editPrice) {
        toast.error(
          "Please enter a price"
        );
        return;
      }

      if (!editCategoryId) {
        toast.error(
          "Please select a category"
        );
        return;
      }

      const price = Number(editPrice);

      if (
        Number.isNaN(price) ||
        price <= 0
      ) {
        toast.error(
          "Please enter a valid price"
        );
        return;
      }

      setUpdating(true);

      const updatedItem =
        await updateItem(
          token,
          Number(editCategoryId),
          selectedItem.id,
          editName.trim(),
          price
        );

      // Update item in table

      setItems((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id
            ? {
                ...item,
                ...updatedItem,
              }
            : item
        )
      );

      toast.success(
        "Item updated successfully"
      );

      setShowEditModal(false);
      setSelectedItem(null);

      setEditName("");
      setEditPrice("");
      setEditCategoryId("");

    } catch (error) {
      console.error(
        "Update item error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Update failed"
      );

    } finally {
      setUpdating(false);
    }
  };


  // =========================================================
  // START DELETE
  // =========================================================

  const startDelete = () => {
    setDeleteStep(true);
  };


  // =========================================================
  // CANCEL DELETE
  // =========================================================

  const cancelDelete = () => {
    setDeleteStep(false);
  };


  // =========================================================
  // DELETE ITEM
  // =========================================================

  const handleDelete = async () => {
    try {
      const token =
        localStorage.getItem("token2");

      if (!token) {
        toast.error(
          "Your session has expired"
        );
        return;
      }

      if (!selectedItem) {
        toast.error(
          "No item selected"
        );
        return;
      }

      setDeleting(true);

      await deleteItem(
        token,
        selectedItem.categoryId,
        selectedItem.id
      );

      // Remove from table

      setItems((prev) =>
        prev.filter(
          (item) =>
            item.id !== selectedItem.id
        )
      );

      toast.success(
        "Item deleted successfully"
      );

      // Close everything

      setShowEditModal(false);
      setSelectedItem(null);
      setDeleteStep(false);

    } catch (error) {
      console.error(
        "Delete item error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Delete failed"
      );

    } finally {
      setDeleting(false);
    }
  };


  // =========================================================
  // CLOSE EDIT MODAL
  // =========================================================

  const closeEditModal = () => {
    setShowEditModal(false);

    setSelectedItem(null);

    setEditName("");
    setEditPrice("");
    setEditCategoryId("");

    setDeleteStep(false);
  };


  // =========================================================
  // CLOSE ADD MODAL
  // =========================================================

  const closeAddModal = () => {
    setShowAddModal(false);

    setItemName("");
    setItemPrice("");
    setSelectedCategoryId("");
  };


  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-black p-4 text-white md:p-6">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold">
            Items
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Manage laundry items and their prices
          </p>
        </div>


        <button
          type="button"
          onClick={() =>
            setShowAddModal(true)
          }
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />

          Add Item
        </button>

      </div>


      {/* ================================================= */}
      {/* TABLE */}
      {/* ================================================= */}

      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-950">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[750px] text-left">

            <thead className="border-b border-gray-800 bg-gray-900">

              <tr>

                <th className="px-5 py-4 text-sm font-semibold text-gray-300">
                  ID
                </th>

                <th className="px-5 py-4 text-sm font-semibold text-gray-300">
                  Item
                </th>

                <th className="px-5 py-4 text-sm font-semibold text-gray-300">
                  Category
                </th>

                <th className="px-5 py-4 text-sm font-semibold text-gray-300">
                  Price
                </th>

                <th className="px-5 py-4 text-sm font-semibold text-gray-300">
                  Created
                </th>

                <th className="px-5 py-4 text-right text-sm font-semibold text-gray-300">
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {/* LOADING */}

              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-gray-400"
                  >
                    Loading items...
                  </td>
                </tr>
              )}


              {/* EMPTY */}

              {!loading &&
                items.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-gray-400"
                    >
                      No items found.
                    </td>
                  </tr>
                )}


              {/* ITEMS */}

              {!loading &&
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-800 transition hover:bg-gray-900/60"
                  >

                    {/* ID */}

                    <td className="px-5 py-4 text-sm text-gray-400">
                      #{item.id}
                    </td>


                    {/* ITEM */}

                    <td className="px-5 py-4">

                      <span className="font-medium text-white">
                        {item.name}
                      </span>

                    </td>


                    {/* CATEGORY */}

                    <td className="px-5 py-4">

                      <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                        {getCategoryName(
                          item.categoryId
                        )}
                      </span>

                    </td>


                    {/* PRICE */}

                    <td className="px-5 py-4 text-sm font-medium text-white">
                      ₦
                      {item.price.toLocaleString()}
                    </td>


                    {/* CREATED */}

                    <td className="px-5 py-4 text-sm text-gray-400">
                      {new Date(
                        item.createdAt
                      ).toLocaleDateString()}
                    </td>


                    {/* ACTION */}

                    <td className="px-5 py-4 text-right">

                      <button
                        type="button"
                        onClick={() =>
                          openEdit(item)
                        }
                        title="Edit item"
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white"
                      >
                        <MoreVertical
                          size={18}
                        />
                      </button>

                    </td>

                  </tr>
                ))}

            </tbody>

          </table>

        </div>

      </div>


      {/* ================================================= */}
      {/* ADD ITEM MODAL */}
      {/* ================================================= */}

      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={closeAddModal}
        >

          <div
            className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="mb-6 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-semibold text-white">
                  Add Item
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Add a new laundry item
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddModal}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white"
              >
                <X size={20} />
              </button>

            </div>


            {/* CATEGORY */}

            <div className="mb-4">

              <label className="mb-2 block text-sm font-medium text-gray-300">
                Category
              </label>

              <select
                value={selectedCategoryId}
                onChange={(e) =>
                  setSelectedCategoryId(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-700 bg-black px-4 py-3 text-white outline-none focus:border-blue-500"
              >

                <option value="">
                  Select category
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  )
                )}

              </select>

            </div>


            {/* NAME */}

            <div className="mb-4">

              <label className="mb-2 block text-sm font-medium text-gray-300">
                Item Name
              </label>

              <input
                type="text"
                value={itemName}
                onChange={(e) =>
                  setItemName(
                    e.target.value
                  )
                }
                placeholder="e.g. 2-Piece Suit"
                className="w-full rounded-lg border border-gray-700 bg-black px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-blue-500"
              />

            </div>


            {/* PRICE */}

            <div className="mb-6">

              <label className="mb-2 block text-sm font-medium text-gray-300">
                Price
              </label>

              <input
                type="number"
                min="0"
                value={itemPrice}
                onChange={(e) =>
                  setItemPrice(
                    e.target.value
                  )
                }
                placeholder="e.g. 3500"
                className="w-full rounded-lg border border-gray-700 bg-black px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-blue-500"
              />

            </div>


            {/* BUTTONS */}

            <div className="flex justify-end gap-3">

              <button
                type="button"
                onClick={closeAddModal}
                className="rounded-lg border border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={adding}
                onClick={handleAddItem}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {adding
                  ? "Adding..."
                  : "Add Item"}
              </button>

            </div>

          </div>

        </div>
      )}


      {/* ================================================= */}
      {/* EDIT + DELETE MODAL */}
      {/* ================================================= */}

      {showEditModal &&
        selectedItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={closeEditModal}
          >

            <div
              className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-2xl"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* ================================================= */}
              {/* NORMAL EDIT STEP */}
              {/* ================================================= */}

              {!deleteStep && (
                <>
                  {/* HEADER */}

                  <div className="mb-6 flex items-center justify-between">

                    <div>

                      <div className="flex items-center gap-2">

                        <Pencil
                          size={18}
                          className="text-blue-500"
                        />

                        <h2 className="text-xl font-semibold text-white">
                          Edit Item
                        </h2>

                      </div>

                      <p className="mt-1 text-sm text-gray-400">
                        Update item information
                      </p>

                    </div>


                    <button
                      type="button"
                      onClick={closeEditModal}
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
                    >
                      <X size={20} />
                    </button>

                  </div>


                  {/* CATEGORY */}

                  <div className="mb-4">

                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Category
                    </label>

                    <select
                      value={editCategoryId}
                      onChange={(e) =>
                        setEditCategoryId(
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-700 bg-black px-4 py-3 text-white outline-none focus:border-blue-500"
                    >

                      <option value="">
                        Select category
                      </option>

                      {categories.map(
                        (category) => (
                          <option
                            key={category.id}
                            value={category.id}
                          >
                            {category.name}
                          </option>
                        )
                      )}

                    </select>

                  </div>


                  {/* NAME */}

                  <div className="mb-4">

                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Item Name
                    </label>

                    <input
                      type="text"
                      value={editName}
                      onChange={(e) =>
                        setEditName(
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-700 bg-black px-4 py-3 text-white outline-none focus:border-blue-500"
                    />

                  </div>


                  {/* PRICE */}

                  <div className="mb-6">

                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Price
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={editPrice}
                      onChange={(e) =>
                        setEditPrice(
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-700 bg-black px-4 py-3 text-white outline-none focus:border-blue-500"
                    />

                  </div>


                  {/* BUTTONS */}

                  <div className="flex items-center justify-between">

                    {/* DELETE */}

                    <button
                      type="button"
                      onClick={startDelete}
                      className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                      <Trash2 size={16} />

                      Delete
                    </button>


                    <div className="flex gap-3">

                      <button
                        type="button"
                        onClick={closeEditModal}
                        className="rounded-lg border border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        disabled={updating}
                        onClick={handleUpdate}
                        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {updating
                          ? "Saving..."
                          : "Save Changes"}
                      </button>

                    </div>

                  </div>
                </>
              )}


              {/* ================================================= */}
              {/* DELETE CONFIRMATION STEP */}
              {/* ================================================= */}

              {deleteStep && (
                <>

                  {/* HEADER */}

                  <div className="mb-5 flex items-center justify-between">

                    <h2 className="text-xl font-semibold text-white">
                      Delete Item
                    </h2>

                    <button
                      type="button"
                      onClick={cancelDelete}
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
                    >
                      <X size={20} />
                    </button>

                  </div>


                  {/* WARNING */}

                  <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4">

                    <div className="flex gap-3">

                      <Trash2
                        size={22}
                        className="mt-0.5 shrink-0 text-red-500"
                      />

                      <div>

                        <p className="font-medium text-red-400">
                          Are you sure?
                        </p>

                        <p className="mt-1 text-sm leading-6 text-gray-400">
                          You are about to delete{" "}
                          <span className="font-medium text-white">
                            "{selectedItem.name}"
                          </span>
                          . This action cannot be undone.
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* BUTTONS */}

                  <div className="flex justify-end gap-3">

                    <button
                      type="button"
                      disabled={deleting}
                      onClick={cancelDelete}
                      className="rounded-lg border border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800 disabled:opacity-50"
                    >
                      Cancel
                    </button>


                    <button
                      type="button"
                      disabled={deleting}
                      onClick={handleDelete}
                      className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      <Trash2 size={16} />

                      {deleting
                        ? "Deleting..."
                        : "Delete Item"}

                    </button>

                  </div>

                </>
              )}

            </div>

          </div>
        )}

    </div>
  );
}