const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getToken() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Authentication token not found");
  }

  return token;
}

// =====================================================
// DASHBOARD
// =====================================================

// GET statistics
export async function getStatistics() {
  const token = getToken();

  const response = await fetch(`${API_URL}/apiv1/count`, {
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
// CUSTOMERS
// =====================================================

// GET all customers
export async function getCustomers() {
  const token = getToken();

  const response = await fetch(`${API_URL}/apiv1/customers`, {
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
export async function getCustomer(customerId: string) {
  const token = getToken();

  const response = await fetch(
    `${API_URL}/apiv1/customers/${customerId}`,
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

// ADD customer
export async function addCustomer(customerData: unknown) {
  const token = getToken();

  const response = await fetch(`${API_URL}/apiv1/addCustomer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(customerData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to add customer");
  }

  return data;
}

// UPDATE customer
export async function updateCustomer(
  customerId: string,
  customerData: unknown
) {
  const token = getToken();

  const response = await fetch(
    `${API_URL}/apiv1/customers/${customerId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(customerData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update customer");
  }

  return data;
}

// ADJUST customer balance
export async function adjustCustomerBalance(
  customerId: string,
  balanceData: unknown
) {
  const token = getToken();

  const response = await fetch(
    `${API_URL}/apiv1/customers/${customerId}/balance`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(balanceData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to adjust customer balance");
  }

  return data;
}

// DELETE customer
export async function deleteCustomer(customerId: string) {
  const token = getToken();

  const response = await fetch(
    `${API_URL}/apiv1/customers/${customerId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete customer");
  }

  return data;
}


// =====================================================
// ORDERS
// =====================================================

// GET all orders
export async function getOrders() {
  const token = getToken();

  const response = await fetch(`${API_URL}/apiv1/orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to get orders");
  }

  return data;
}

// GET recent orders
export async function getRecentOrders() {
  const token = getToken();

  const response = await fetch(`${API_URL}/apiv1/orders/recent`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to get recent orders");
  }

  return data;
}

// GET completed orders
export async function getCompletedOrders() {
  const token = getToken();

  const response = await fetch(`${API_URL}/apiv1/orders/completed`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to get completed orders");
  }

  return data;
}

// GET order by ID
export async function getOrder(orderId: string) {
  const token = getToken();

  const response = await fetch(
    `${API_URL}/apiv1/orders/${orderId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to get order");
  }

  return data;
}

// CREATE order
export async function createOrder(orderData: unknown) {
  const token = getToken();

  const response = await fetch(`${API_URL}/apiv1/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create order");
  }

  return data;
}

// UPDATE order status
export async function updateOrderStatus(
  orderId: string,
  statusData: unknown
) {
  const token = getToken();

  const response = await fetch(
    `${API_URL}/apiv1/orders/${orderId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(statusData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update order status");
  }

  return data;
}

// COMPLETE order
export async function completeOrder(orderId: string) {
  const token = getToken();

  const response = await fetch(
    `${API_URL}/apiv1/orders/${orderId}/complete`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to complete order");
  }

  return data;
}

// DELETE order
export async function deleteOrder(orderId: string) {
  const token = getToken();

  const response = await fetch(
    `${API_URL}/apiv1/orders/${orderId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete order");
  }

  return data;
}