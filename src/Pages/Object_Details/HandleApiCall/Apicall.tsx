import axios from "axios";

export async function fetchData<T>(url: string): Promise<T> {
    const response = await axios.get<T>(url);

    return response.data;
}