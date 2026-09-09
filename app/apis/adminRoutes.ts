const url = process.env.NEXT_PUBLIC_API_URL;

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

export async function getStats(token2: string): Promise<StatsDataResponse> {
    if (!token2) {
        throw new Error("Token is missing or expired");
    }

    const response = await fetch(`${url}/apiv1/admin/count`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token2}`,
        },
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to fetch");
    }

    return await response.json();
}

//customer dash table 
export type Customer = {
    id: number;
    username: string;
    phonenumber: string;
    balance: number;
    createdAt: string;
    updatedAt: string;
};

type CustomersResponse = {
    message: string;
    getCustomer: Customer[];
};

export async function getAdminCustomers(token2: string): Promise<Customer[]> {
    if (!token2) {
        throw new Error("Token is missing or expired");
    }

    const response = await fetch(
        `${url}/apiv1/admin/customers`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token2}`,
            },
        }
    );

    const data: CustomersResponse = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch customers");
    }

    return data.getCustomer;
}


///------CATEGORIES
export type Item = {
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
  items?: Item[];
};

// ================= GET CATEGORIES =================
export async function getCategories(
    token2: string
): Promise<Category[]> {
    const response = await fetch(
        `${url}/apiv1/admin/allCategory`,
        {
            headers: {
                Authorization: `Bearer ${token2}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to load categories");
    }

    return data.categories;
}

// ================= ADD CATEGORY =================
export async function addCategory(
    token2: string,
    name: string
) {
    const response = await fetch(
        `${url}/apiv1/admin/addCategory`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token2}`,
            },
            body: JSON.stringify({
                name,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to create category");
    }

    return data.newCategory;
}

// ================= UPDATE CATEGORY =================
export async function updateCategory(
    token2: string,
    categoryId: number,
    name: string
) {
    const response = await fetch(
        `${url}/apiv1/admin/updateCategory`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token2}`,
            },
            body: JSON.stringify({
                categoryId,
                name,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to update category");
    }

    return data.updateCategoryName;
}

//--DELETE CATEGORY -- 

export async function deleteCategory(token2: string, categoryId: number) {
    const response = await fetch(`${url}/apiv1/admin/deleteCategory`, {
        method: "DELETE", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token2}`, },
        body: JSON.stringify({ categoryId, }),
    }); const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to delete category");
    }

    return data;
}


//---ITEMS----
// ================= GET ALL ITEMS =================

export async function getItems(token: string): Promise<Item[]> {
  const response = await fetch(
    `${url}/apiv1/admin/allItem`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to get items"
    );
  }

  return data.items;
}


// ================= ADD ITEM =================

export async function addItem(
  token2: string,
  categoryId: number,
  name: string,
  price: number
): Promise<Item> {
  const response = await fetch(
    `${url}/apiv1/admin/addItem`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token2}`,
      },
      body: JSON.stringify({
        categoryId,
        name,
        price,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to add item"
    );
  }

  return data.addItem;
}


// ================= DELETE ITEM =================

export async function deleteItem(
  token2: string,
  categoryId: number,
  itemId: number
) {
  const response = await fetch(
    `${url}/apiv1/admin/deleteItem`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token2}`,
      },
      body: JSON.stringify({
        categoryId,
        itemId,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to delete item"
    );
  }

  return data;
}

//---UPDATE ITEM
export async function updateItem(
  token2: string,
  categoryId: number,
  itemId: number,
  name: string,
  price: number
): Promise<Item> {
  const response = await fetch(
    `${url}/apiv1/admin/updateItem`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token2}`,
      },
      body: JSON.stringify({
        categoryId,
        itemId,
        name,
        price,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to update item"
    );
  }

 
  return data.updateItem;
}


//---ORDERS PAGE
export type OrderItem = {
  id: number;
  orderId: number;
  itemId: number;
  quantity: number;
  price: number;
  item: {
    id: number;
    name: string;
    price: number;
  };
};

export type Order = {
  id: number;
  customerId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  completed: boolean;
  completedAt: string | null;
  totalAmount: number | null;
  items: OrderItem[];
  customer: {
    id: number;
    username: string;
    phonenumber: string;
    balance: number;
  };
};

export async function getRecentOrders(
  token2: string
): Promise<Order[]> {
  const response = await fetch(
    `${url}/apiv1/admin/orders/recent`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token2}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to get orders");
  }

  return data.orders;
}


//--Customer page
// Add this to your adminRoutes.ts or userRoutes.ts

export type ReversePaymentResponse = {
  message: string;
  order: Order;
  updatedCustomer: Omit<Customer, "order">;
};

export async function reversePayment(
  orderId: number,
  token2: string
): Promise<ReversePaymentResponse> {
  const response = await fetch(`${url}/apiv1/admin/orders/${orderId}/reverse-payment`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token2}`,
    },
  });
 const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to get orders");
  }
  return data;
}