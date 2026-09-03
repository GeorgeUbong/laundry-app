const url = process.env.NEXT_PUBLIC_API_URL

export interface StatsDataResponse {
    customers: number;
    orders: number;
    income: number;
    categories: number
}

export async function getStats (
    token: string
): Promise<StatsDataResponse> {
    const response = await fetch (`${url}/apiv1/count`, {
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