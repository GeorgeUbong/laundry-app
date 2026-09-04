const url = process.env.NEXT_PUBLIC_API_URL


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
};

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

  const data = await response.json();

  console.log("Customers API response:", data);

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to get customers"
    );
  }

  return data;
}

//adding a customer 
export type CreateCustomerData = {
  username: string;
  phonenumber: string;
  balance: number;
};

export type CreateCustomerResponse = {
  message: string;
  customer?: {
    id: number;
    username: string;
    phonenumber: string;
    balance: number;
    createdAt: string;
    updatedAt: string;
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

  const data = await response.json();

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

  const data = await response.json();

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
  status: string;
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
    completedAt: string;
    totalAmount: number;
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
  const response = await fetch(`${url}/apiv1/addOrders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });

  const data = await response.json();

  console.log("Add order response:", data);

  if (!response.ok) {
    throw new Error(data.message || "Failed to create order");
  }

  return data;
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
  completedAt: string;
  totalAmount: number;
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