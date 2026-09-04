const url = process.env.NEXT_PUBLIC_API_URL

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