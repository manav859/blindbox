import axios from 'axios';

// In a real application, token comes from SHOPLINE Bridge / App Context.
const token = 'mock-dev-token';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    Authorization: `Bearer ${token}`
  }
});

// Mock hooks or calls for Blind Box config
export const fetchBlindBoxes = async () => {
  const { data } = await api.get('/admin/blind-boxes');
  return data;
};

export const fetchBlindBox = async (id: string) => {
  const { data } = await api.get(`/admin/blind-boxes/${id}`);
  return data;
};

export const createBlindBox = async (payload: any) => {
  const { data } = await api.post('/admin/blind-boxes', payload);
  return data;
};

export const updateBlindBox = async ({ id, payload }: { id: string; payload: any }) => {
  const { data } = await api.put(`/admin/blind-boxes/${id}`, payload);
  return data;
};

export const fetchProducts = async () => {
  const { data } = await api.get('/admin/products');
  return data;
};
