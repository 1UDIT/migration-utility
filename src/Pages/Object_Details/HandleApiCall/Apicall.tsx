import axios from "axios";

export async function fetchData<T>(url: string, method: "GET" | "POST" | "PUT" | "DELETE" = "GET", body?: any): Promise<T> {
    const config = {
        method,
        url,
        data: body || {},
    };

     const response = await axios.request<T>(config);

    return response.data;
}