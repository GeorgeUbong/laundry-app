//admin functs 
const url = process.env.NEXT_PUBLIC_API_URL;

export interface LoginData {
    email: string;
    password: string;
}

export interface LoginResponse {
    message: string;
    token: string;
}

export async function loginAdmin (
    email: string,
    password: string
): Promise<LoginResponse> {
    const response = await fetch(`${url}/apiv1/login/admin`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email, password
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Login failed");
    }

    //Save JWT token
    localStorage.setItem("token", data.token);

    return data;
}