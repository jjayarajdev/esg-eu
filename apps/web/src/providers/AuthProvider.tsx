import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, setTenantId, getTenantId } from '../lib/api-client';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  schema_name: string;
}

interface AuthContextType {
  tenant: Tenant | null;
  tenants: Tenant[];
  loading: boolean;
  selectTenant: (id: string) => void;
  createTenant: (name: string, slug: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  tenant: null,
  tenants: [],
  loading: true,
  selectTenant: () => {},
  createTenant: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTenants();
  }, []);

  async function loadTenants() {
    try {
      const res = await api<{ data: Tenant[] }>('/tenants');
      setTenants(res.data);
      // Auto-select first tenant if available
      if (res.data.length > 0) {
        const savedId = getTenantId();
        const selected = savedId
          ? res.data.find((t) => t.id === savedId) || res.data[0]
          : res.data[0];
        setTenantId(selected.id);
        setTenant(selected);
      }
    } catch {
      // API not available
    } finally {
      setLoading(false);
    }
  }

  function selectTenant(id: string) {
    const t = tenants.find((t) => t.id === id);
    if (t) {
      setTenantId(t.id);
      setTenant(t);
    }
  }

  async function createTenant(name: string, slug: string) {
    const res = await api<{ data: Tenant }>('/tenants', {
      method: 'POST',
      body: { name, slug },
    });
    setTenants((prev) => [...prev, res.data]);
    setTenantId(res.data.id);
    setTenant(res.data);
  }

  return (
    <AuthContext.Provider value={{ tenant, tenants, loading, selectTenant, createTenant }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
