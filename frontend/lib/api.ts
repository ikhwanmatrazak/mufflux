import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Attach access token from store
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("mufflux-user");
    if (stored) {
      const { state } = JSON.parse(stored);
      if (state?.accessToken) {
        config.headers.Authorization = `Bearer ${state.accessToken}`;
      }
    }
  }
  return config;
});

// Refresh token on 401
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        localStorage.setItem("mufflux-token", data.access_token);
        error.config.headers.Authorization = `Bearer ${data.access_token}`;
        return api(error.config);
      } catch {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Typed API helpers
export const authApi = {
  register: (data: any) => api.post("/auth/register", data),
  login: (data: any) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
  refresh: () => api.post("/auth/refresh"),
};

export const productsApi = {
  list: (params?: any) => api.get("/products", { params }),
  get: (slug: string) => api.get(`/products/${slug}`),
  create: (data: any) => api.post("/products", data),
  update: (id: number, data: any) => api.put(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
  uploadImage: (id: number, file: File, isPrimary = false) => {
    const form = new FormData();
    form.append("file", file);
    return api.post(`/products/${id}/images?is_primary=${isPrimary}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export const categoriesApi = {
  list: () => api.get("/categories"),
};

export const motorcycleApi = {
  brands: () => api.get("/motorcycle/brands"),
  models: (brandId?: number) => api.get("/motorcycle/models", { params: { brand_id: brandId } }),
  engines: () => api.get("/motorcycle/engines"),

  createBrand: (data: { name: string }) => api.post("/motorcycle/brands", data),
  updateBrand: (id: number, data: { name?: string }) => api.put(`/motorcycle/brands/${id}`, data),
  deleteBrand: (id: number) => api.delete(`/motorcycle/brands/${id}`),
  uploadBrandLogo: (id: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post(`/motorcycle/brands/${id}/logo`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  createModel: (data: { brand_id: number; name: string; year_from: number; year_to?: number | null }) =>
    api.post("/motorcycle/models", data),
  updateModel: (id: number, data: any) => api.put(`/motorcycle/models/${id}`, data),
  deleteModel: (id: number) => api.delete(`/motorcycle/models/${id}`),

  createEngine: (data: { cc: number; label: string }) => api.post("/motorcycle/engines", data),
  deleteEngine: (id: number) => api.delete(`/motorcycle/engines/${id}`),
};

export const ordersApi = {
  create: (data: any) => api.post("/orders", data),
  list: (params?: any) => api.get("/orders", { params }),
  get: (id: number) => api.get(`/orders/${id}`),
  updateStatus: (id: number, data: any) => api.put(`/orders/${id}/status`, data),
};

export const paymentsApi = {
  createBillplz: (orderId: number) => api.post(`/payments/billplz?order_id=${orderId}`),
};

export const wishlistApi = {
  get: () => api.get("/wishlist"),
  add: (productId: number) => api.post(`/wishlist/${productId}`),
  remove: (productId: number) => api.delete(`/wishlist/${productId}`),
};

export const reviewsApi = {
  submit: (data: any) => api.post("/reviews", data),
  approve: (id: number) => api.put(`/reviews/${id}/approve`),
};

export const discountApi = {
  validate: (data: any) => api.post("/discount/validate", data),
};

export const blogApi = {
  list: (params?: any) => api.get("/blog", { params }),
  get: (slug: string) => api.get(`/blog/${slug}`),
  create: (data: any) => api.post("/blog", data),
  update: (id: number, data: any) => api.put(`/blog/${id}`, data),
};

export const usersApi = {
  list: () => api.get("/users"),
  updateProfile: (data: any) => api.put("/users/me", data),
  getAddresses: () => api.get("/users/me/addresses"),
  addAddress: (data: any) => api.post("/users/me/addresses", data),
  updateAddress: (id: number, data: any) => api.put(`/users/me/addresses/${id}`, data),
  deleteAddress: (id: number) => api.delete(`/users/me/addresses/${id}`),
};

export const installationApi = {
  create: (data: any) => api.post("/installation/bookings", data),
  list: () => api.get("/installation/bookings"),
  update: (id: number, status: string) => api.put(`/installation/bookings/${id}?status=${status}`),
};

export const adminApi = {
  dashboard: () => api.get("/admin/dashboard"),
  listOrders: (params?: any) => api.get("/admin/orders", { params }),
  getOrder: (id: number) => api.get(`/admin/orders/${id}`),
  downloadReport: (params?: { start_date?: string; end_date?: string }) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const query = new URLSearchParams();
    if (params?.start_date) query.set("start_date", params.start_date);
    if (params?.end_date) query.set("end_date", params.end_date);
    const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/admin/reports/orders?${query.toString()}`;
    const a = document.createElement("a");
    a.href = url;
    // Use fetch to download with auth header
    return fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        a.href = blobUrl;
        a.download = `mufflux_orders_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(blobUrl);
      });
  },
};

export const shippingApi = {
  rates: (params?: any) => api.get("/shipping/rates", { params }),
};
