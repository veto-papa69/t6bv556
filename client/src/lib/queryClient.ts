import { QueryClient } from "@tanstack/react-query";
async function throwIfResNotOk(res: Response) { if (!res.ok) { const t = (await res.text()) || res.statusText; throw new Error(`${res.status}: ${t}`); } }
const BASE_URL = "";
export async function apiRequest(m: string, u: string, d?: unknown): Promise<Response> {
  const full = u.startsWith("http") ? u : `${BASE_URL}${u}`;
  const r = await fetch(full, { method: m, headers: d ? { "Content-Type": "application/json" } : {}, body: d ? JSON.stringify(d) : undefined, credentials: "include" });
  await throwIfResNotOk(r); return r;
}
export const queryClient = new QueryClient({ defaultOptions: { queries: { queryFn: async ({ queryKey }) => { const r = await apiRequest("GET", queryKey[0] as string); return r.json(); }, retry: (c, e:any) => { if (e?.status===401||e?.status===403) return false; return c<3; }, staleTime: 1000*60*5, gcTime: 1000*60*10, }, }, });
