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
            Authorization: `Bearer ${token2}`,  // ✅ Token is passed here
        },
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to fetch");
    }

    return await response.json();
}