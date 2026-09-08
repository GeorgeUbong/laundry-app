// adminRoutes.ts
const url = process.env.NEXT_PUBLIC_API_URL;

export interface LoginData {
    email: string;
    password: string;
}

export interface LoginResponse {
    message: string;
    ADMIN_TOKEN: string;  // ✅ Keep consistent naming
}

export async function loginAdmin(
    email: string,
    password: string
): Promise<LoginResponse> {
    const response = await fetch(`${url}/apiv1/login/admin`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Login failed");
    }

    // ✅ Save with consistent naming
     sessionStorage.setItem("token2", data.ADMIN_TOKEN);
    localStorage.setItem("token2", data.ADMIN_TOKEN);  // Changed from data.token2
    localStorage.setItem("admin", JSON.stringify(data.admin));

    return data;
}