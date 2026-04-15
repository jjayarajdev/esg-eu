const API_BASE = '/api/v1';

/** Current mock tenant/user context — stored in memory */
let currentTenantId: string | null = null;

export function setTenantId(id: string) {
  currentTenantId = id;
  // Also store on window for non-api-client fetches (e.g., file downloads)
  (window as any).__tenantId = id;
}

export function getTenantId(): string | null {
  return currentTenantId;
}

interface ApiOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

/** Typed fetch wrapper that auto-includes tenant headers */
export async function api<T = any>(
  path: string,
  options?: ApiOptions,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (currentTenantId) {
    headers['X-Tenant-Id'] = currentTenantId;
    headers['X-User-Email'] = 'admin@localhost';
    headers['X-User-Roles'] = 'admin';
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...options?.headers },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
    throw new Error(err.error?.message || `API error: ${res.status}`);
  }

  return res.json();
}
