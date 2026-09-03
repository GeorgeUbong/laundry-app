const API_URL = process.env.NEXT_PUBLIC_API_URL;
const ADMIN_URL = "/apiv1/admin/";

function getToken() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Authentication token not found");
  }

  return token;
}


// =====================================================
// DASHBOARD / STATISTICS
// =====================================================

// GET admin statistics
export async function getAdminStatistics() {
  const token = getToken();

  const response = await fetch(`${API_URL}/apiv1/admin/count`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to get statistics");
  }

  return data;
}


// =====================================================
// CATEGORIES
// =====================================================

// GET all categories
export async function getCategories() {
  const token = getToken();

  const response = await fetch(`${API_URL}${ADMIN_URL}allCategory`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to get categories");
  }

  return data;
}

// CREATE category
export async function addCategory(categoryData: unknown) {
  const token = getToken();

  const response = await fetch(`${API_URL}${ADMIN_URL}addCategory`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(categoryData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create category");
  }

  return data;
}

// UPDATE category
export async function updateCategory(categoryData: unknown) {
  const token = getToken();

  const response = await fetch(`${API_URL}${ADMIN_URL}updateCategory`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(categoryData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update category");
  }

  return data;
}

// DELETE category
export async function deleteCategory(categoryData: unknown) {
  const token = getToken();

  const response = await fetch(`${API_URL}${ADMIN_URL}deleteCategory`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(categoryData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete category");
  }

  return data;
}


// =====================================================
// ITEMS
// =====================================================

// GET all items
export async function getItems() {
  const token = getToken();

  const response = await fetch(`${API_URL}${ADMIN_URL}allItem`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to get items");
  }

  return data;
}

// CREATE item
export async function addItem(itemData: unknown) {
  const token = getToken();

  const response = await fetch(`${API_URL}${ADMIN_URL}addItem`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(itemData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to add item");
  }

  return data;
}

// UPDATE item
export async function updateItem(itemData: unknown) {
  const token = getToken();

  const response = await fetch(`${API_URL}${ADMIN_URL}updateItem`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(itemData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update item");
  }

  return data;
}

// DELETE item
export async function deleteItem(itemData: unknown) {
  const token = getToken();

  const response = await fetch(`${API_URL}${ADMIN_URL}deleteItem`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(itemData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete item");
  }

  return data;
}


// =====================================================
// CUSTOMERS
// =====================================================

// GET all customers
export async function getAdminCustomers() {
  const token = getToken();

  const response = await fetch(`${API_URL}${ADMIN_URL}customers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to get customers");
  }

  return data;
}

// GET customer by ID
export async function getAdminCustomer(customerId: string) {
  const token = getToken();

  const response = await fetch(
    `${API_URL}${ADMIN_URL}customers/${customerId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to get customer");
  }

  return data;
}


// =====================================================
// ORDERS
// =====================================================

// GET recent orders
export async function getAdminRecentOrders() {
  const token = getToken();

  const response = await fetch(
    `${API_URL}${ADMIN_URL}orders/recent`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to get recent orders");
  }

  return data;
}

// GET completed orders
export async function getAdminCompletedOrders() {
  const token = getToken();

  const response = await fetch(
    `${API_URL}${ADMIN_URL}orders/completed`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to get completed orders");
  }

  return data;
}

// REVERSE order payment
export async function reverseOrderPayment(orderId: string) {
  const token = getToken();

  const response = await fetch(
    `${API_URL}${ADMIN_URL}orders/${orderId}/reverse-payment`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to reverse order payment");
  }

  return data;
}