import { QueryClient } from "@tanstack/react-query";
async function throwIfResNotOk(res: Response) {
  if (!res.ok) { const text = (await res.text()) || res.statusText; throw new Error(`${res.status}: ${text}`); }
}
const BASE_URL = "";
export async function apiRequest(method: string, url: string, data?: unknown): Promise<Response> {
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
  const res = await fetch(fullUrl, {
    method, headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined, credentials: "include",
  });
  await throwIfResNotOk(res); return res;
}
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => { const response = await apiRequest("GET", queryKey[0] as string); return response.json(); },
      retry: (failureCount, error: any) => { if (error?.status === 401 || error?.status === 403) return false; return failureCount < 3; },
      staleTime: 1000 * 60 * 5, gcTime: 1000 * 60 * 10,
    },
  },
});
