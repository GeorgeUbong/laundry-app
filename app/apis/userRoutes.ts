const url = process.env.NEXT_PUBLIC_API_URL

async function parseApiResponse<T>(response: Response): Promise<T> {
  const responseText = await response.text();

  if (!responseText) {
    return {} as T;
  }

  try {
    return JSON.parse(responseText) as T;
  } catch {
    throw new Error(
      `API returned a non-JSON response (HTTP ${response.status}). Check the API URL and endpoint.`
    );
  }
}


//-----FOR THE DASHBOARD ------

//get Dashboard stats
export type StatsData = {
  categories: number;
  customers: number;
  income: number;
  orders: number;
};

export type StatsDataResponse = {
  message: string;
  dashboardData: StatsData;
};

export async function getStats(
  token: string
): Promise<StatsDataResponse> {
  const response = await fetch(`${url}/apiv1/count`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch");
  }
  console.log(data);
  return data;
}


// get all customers
export type Customer = {
  id: number;
  username: string;
  phonenumber: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
  order: Order[];
  orderCount?: number;
};

type ApiCustomer = Omit<Customer, "order"> & {
  order?: Order[] | number;
  orders?: Order[] | number;
  orderCount?: number;
  ordersCount?: number;
  _count?: {
    order?: number;
    orders?: number;
  };
};

function normalizeCustomer(customer: ApiCustomer): Customer {
  const order = Array.isArray(customer.order)
    ? customer.order
    : Array.isArray(customer.orders)
      ? customer.orders
      : [];
  const orderCount =
    customer.orderCount ??
    customer.ordersCount ??
    customer._count?.order ??
    customer._count?.orders ??
    (typeof customer.order === "number" ? customer.order : undefined) ??
    (typeof customer.orders === "number" ? customer.orders : order.length);

  return {
    ...customer,
    order,
    orderCount,
  };
}

// API response type
export type CustomersResponse = {
  message: string;
  getCustomer: Customer[];
};

export async function getCustomers(
  token: string
): Promise<CustomersResponse> {
  const response = await fetch(`${url}/apiv1/users`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await parseApiResponse<CustomersResponse>(response);

  console.log("Customers API response:", data);

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to get customers"
    );
  }

  return {
    ...data,
    getCustomer: data.getCustomer.map(normalizeCustomer),
  };
}

export type CustomerResponse = {
  message: string;
  customer: Customer;
};

export type CustomerMutationResponse = {
  message: string;
  customer?: Customer;
};

export async function getCustomer(
  customerId: number,
  token: string
): Promise<CustomerResponse> {
  const response = await fetch(`${url}/apiv1/customers/${customerId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await parseApiResponse<CustomerResponse>(response);

  if (!response.ok) {
    throw new Error(data.message || "Failed to get customer");
  }

  return {
    ...data,
    customer: normalizeCustomer(data.customer),
  };
}

export type UpdateCustomerData = {
  username: string;
  phonenumber: string;
};
//UPdate customer

export async function updateCustomer(
  customerId: number,
  username: string,
  phonenumber: string,
  token: string
): Promise<CustomerMutationResponse> {
  const response = await fetch(`${url}/apiv1/customers/${customerId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ username, phonenumber }),
  });

  // Check response status BEFORE parsing
  if (!response.ok) {
    let errorMessage = `Failed to update customer (HTTP ${response.status})`;
    try {
      const errorData = await parseApiResponse<{ message?: string }>(response);
      errorMessage = errorData.message || errorMessage;
    } catch {
    }
    throw new Error(errorMessage);
  }

  // Only parse if response is successful
  const data = await parseApiResponse<{ message?: string; customer?: Customer }>(response);

  return { message: data.message || "Customer updated", customer: data.customer };
}


//DELETE CUSTOMER

// ✅ FIXED VERSION - deleteCustomer function

export async function deleteCustomer(
  customerId: number,
  token: string
): Promise<{ message: string }> {
  const response = await fetch(`${url}/apiv1/customers/${customerId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  // ✅ Check status FIRST before parsing
  if (!response.ok) {
    try {
      const errorData = await parseApiResponse<{ message?: string }>(response);
      throw new Error(errorData.message || "Failed to delete customer");
    } catch (error) {
      // If parseApiResponse fails, throw a generic error with status code
      throw new Error(`Failed to delete customer (HTTP ${response.status})`);
    }
  }

  // ✅ Only parse successful responses
  const data = await parseApiResponse<{ message?: string }>(response);

  return { message: data.message || "Customer deleted" };
}

//adding a customer 
export type CreateCustomerData = {
  username: string;
  phonenumber: string;
  balance: number;
};

export type CreateCustomerResponse = {
  message: string;
  customer?: Omit<Customer, "order"> & {
    order?: Order[];
  };
};

export async function addCustomer(
  customerData: CreateCustomerData,
  token: string
): Promise<CreateCustomerResponse> {
  const response = await fetch(`${url}/apiv1/addCustomer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(customerData),
  });

  const data = await parseApiResponse<CreateCustomerResponse>(response);

  console.log("Add customer response:", data);

  if (!response.ok) {
    throw new Error(data.message || "Failed to add customer");
  }

  return data;
}



//----- FOR THE CATEGORY ------
export type CategoryItem = {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  items: CategoryItem[];
};

export type CategoriesResponse = {
  categories: Category[];
};

export async function getCategories(
  token: string
): Promise<CategoriesResponse> {
  const response = await fetch(`${url}/apiv1/categories`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await parseApiResponse<CategoriesResponse & { message?: string }>(response);

  console.log("Categories API response:", data);

  if (!response.ok) {
    throw new Error(data.message || "Failed to get categories");
  }

  return data;
}

//--CRAETE AN ORDER
export type OrderItemInput = {
  itemId: number;
  quantity: number;
};

export type AddOrderData = {
  customerId: number;
  items: OrderItemInput[];
};

export type AddOrderResponse = {
  message: string;
  customer: Customer;
  order: {
    id: number;
    customerId: number;
    status: string;
    completed: boolean;
    completedAt: string | null;
    totalAmount: number | null;
    createdAt: string;
    updatedAt: string;
    customer: Customer;
    items: {
      id: number;
      orderId: number;
      itemId: number;
      quantity: number;
      price: number;
      createdAt: string;
      updatedAt: string;
      item: CategoryItem;
    }[];
  };
  subtotal: number;
};

export async function addOrder(
  orderData: AddOrderData,
  token: string
): Promise<AddOrderResponse> {
  const response = await fetch(`${url}/apiv1/customers/${orderData.customerId}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      status: "pending",
      items: orderData.items,
    }),
  });

  const data = await parseApiResponse<AddOrderResponse>(response);

  console.log("Add order response:", data);

  if (!response.ok) {
    throw new Error(data.message || "Failed to create order");
  }

  return data;
}

export async function deleteOrder(
  orderId: number,
  token: string
): Promise<{ message: string }> {
  const response = await fetch(`${url}/apiv1/orders/${orderId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await parseApiResponse<{ message?: string }>(response);

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete order");
  }

  return { message: data.message || "Order deleted" };
}

export type UpdateOrderStatusData = {
  status: string;
};

export async function updateOrderStatus(
  orderId: number,
  orderData: UpdateOrderStatusData,
  token: string
): Promise<{ message: string; order: Order }> {
  const response = await fetch(`${url}/apiv1/orders/${orderId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });

  const data = await parseApiResponse<{ message?: string; order?: Order }>(response);

  if (!response.ok) {
    throw new Error(data.message || "Failed to update order status");
  }

  if (!data.order) {
    throw new Error(data.message || "The status response did not include an order");
  }

  return { message: data.message || "Order status updated", order: data.order };
}

export async function completeOrder(
  orderId: number,
  token: string
): Promise<CompleteOrderResponse> {
  const response = await fetch(`${url}/apiv1/orders/${orderId}/complete`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await parseApiResponse<CompleteOrderResponse>(response);

  if (!response.ok) {
    throw new Error(data.message || "Failed to complete order");
  }

  if (!data.updatedOrder) {
    throw new Error(data.message || "The completion response did not include an order");
  }

  return data;
}

export type CompleteOrderResponse = {
  message: string;
  updatedOrder: {
    id: number;
    customerId: number;
    status: string;
    completed: boolean;
    completedAt: string | null;
    totalAmount: number | null;
    createdAt: string;
    updatedAt: string;
  };
  updatedCustomer: Omit<Customer, "order">;
  updatedAdmin: {
    id: number;
    username: string;
    email: string;
    balance: number;
    createdAt: string;
    updatedAt: string;
  };
};

export async function addCustomerBalance(
  customerId: number,
  amount: number,
  token: string
): Promise<{ message: string; customer?: Omit<Customer, "order"> }> {
  const response = await fetch(`${url}/apiv1/customers/${customerId}/balance`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount }),
  });

  const data = await parseApiResponse<{ message?: string; customer?: Omit<Customer, "order"> }>(response);

  if (!response.ok) {
    throw new Error(data.message || "Failed to add customer balance");
  }

  return { message: data.message || "Balance added", customer: data.customer };
}


//Get all recentorders
export type OrderCustomer = {
  id: number;
  username: string;
  phonenumber: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  id: number;
  orderId: number;
  itemId: number;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
  item: {
    id: number;
    name: string;
    price: number;
    categoryId: number;
    createdAt: string;
    updatedAt: string;
  };
};

export type Order = {
  id: number;
  customerId: number;
  status: string;
  completed: boolean;
  completedAt: string | null;
  totalAmount: number | null;
  createdAt: string;
  updatedAt: string;
  customer: OrderCustomer;
  items: OrderItem[];
};

export type RecentOrdersResponse = {
  message: string;
  orders: Order[];
};

export async function getRecentOrders(
  token: string
): Promise<RecentOrdersResponse> {
  const response = await fetch(`${url}/apiv1/orders/recent`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  console.log("Recent orders response:", data);

  if (!response.ok) {
    throw new Error(data.message || "Failed to get recent orders");
  }

  return data;
}