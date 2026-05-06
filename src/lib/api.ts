const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

// ── Helpers ────────────────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok || (data as { success?: boolean }).success === false) {
    const message = (data as { message?: string }).message || res.statusText;
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }
  // Our API wraps results in { success: true, data: ... }
  const wrapped = data as { success?: boolean; data?: T };
  return (wrapped.data !== undefined ? wrapped.data : data) as T;
}

// ── Auth ───────────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  // Aliases for compatibility with existing UI
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  role: string;
  createdAt?: string;
  addresses: Address[];
}

export interface Address {
  id: string;
  name: string;
  phone?: string;
  street: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
}

export const authApi = {
  register: async (data: {
    email: string;
    password: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }): Promise<AuthResponse> => {
    // Combine firstName+lastName into name if needed
    const payload = {
      email: data.email,
      password: data.password,
      phone: data.phone,
      name: data.name || [data.firstName, data.lastName].filter(Boolean).join(' ') || undefined,
    };
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<AuthResponse>(res);
  },

  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(res);
  },

  getMe: async (): Promise<UserProfile> => {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: authHeaders() });
    const profile = await handleResponse<UserProfile>(res);
    // Populate compatibility aliases
    return normalizeUser(profile);
  },

  updateMe: async (data: Partial<{
    name: string;
    firstName: string;
    lastName: string;
    phone: string;
    currentPassword: string;
    newPassword: string;
    password: string;
  }>): Promise<UserProfile> => {
    const payload: Record<string, string | undefined> = {};
    if (data.name) payload.name = data.name;
    if (data.firstName || data.lastName) {
      payload.name = [data.firstName, data.lastName].filter(Boolean).join(' ');
    }
    if (data.phone) payload.phone = data.phone;
    if (data.password || data.newPassword) {
      payload.newPassword = data.password || data.newPassword;
      payload.currentPassword = data.currentPassword;
    }
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const profile = await handleResponse<UserProfile>(res);
    return normalizeUser(profile);
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse<{ message: string }>(res);
  },
};

// Split `name` into firstName/lastName for UI compatibility
export function normalizeUser(user: UserProfile): UserProfile {
  const nameParts = (user.name || '').trim().split(' ');
  return {
    ...user,
    firstName: user.firstName ?? nameParts[0] ?? '',
    lastName: user.lastName ?? nameParts.slice(1).join(' ') ?? '',
    addresses: user.addresses ?? [],
  };
}

// ── Cart ──────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  quantity: number;
  size?: string;
  color?: string;
  selectedSize?: string;  // alias for compatibility
  selectedColor?: string; // alias for compatibility
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    thumbImage: string[];
  };
}

export const cartApi = {
  getCart: async (): Promise<CartItem[]> => {
    const res = await fetch(`${API_BASE}/cart`, { headers: authHeaders() });
    return handleResponse<CartItem[]>(res);
  },

  addItem: async (data: {
    productId: string;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
  }): Promise<CartItem> => {
    const res = await fetch(`${API_BASE}/cart`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<CartItem>(res);
  },

  updateItem: async (
    itemId: string,
    data: { quantity: number; selectedSize?: string; selectedColor?: string },
  ): Promise<CartItem> => {
    const res = await fetch(`${API_BASE}/cart/${itemId}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<CartItem>(res);
  },

  removeItem: async (itemId: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/cart/${itemId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse<void>(res);
  },

  clearCart: async (): Promise<void> => {
    const res = await fetch(`${API_BASE}/cart/clear`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse<void>(res);
  },
};

// ── Wishlist ──────────────────────────────────────────────────────────────

export interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
  };
}

export const wishlistApi = {
  getWishlist: async (): Promise<WishlistItem[]> => {
    const res = await fetch(`${API_BASE}/wishlist`, { headers: authHeaders() });
    return handleResponse<WishlistItem[]>(res);
  },

  addItem: async (productId: string): Promise<WishlistItem> => {
    const res = await fetch(`${API_BASE}/wishlist/${productId}`, {
      method: 'POST',
      headers: authHeaders(),
    });
    return handleResponse<WishlistItem>(res);
  },

  removeItem: async (productId: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/wishlist/${productId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse<void>(res);
  },
};

// ── Compare ───────────────────────────────────────────────────────────────

export interface CompareItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    sizes: string[];
    variations: Array<{ color: string; colorCode: string; colorImage?: string; image?: string }>;
  };
}

export const compareApi = {
  getCompare: async (): Promise<CompareItem[]> => {
    const res = await fetch(`${API_BASE}/compare`, { headers: authHeaders() });
    return handleResponse<CompareItem[]>(res);
  },

  addItem: async (productId: string): Promise<CompareItem> => {
    const res = await fetch(`${API_BASE}/compare/${productId}`, {
      method: 'POST',
      headers: authHeaders(),
    });
    return handleResponse<CompareItem>(res);
  },

  removeItem: async (productId: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/compare/${productId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse<void>(res);
  },

  clearCompare: async (): Promise<void> => {
    const res = await fetch(`${API_BASE}/compare/clear`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse<void>(res);
  },
};

// ── Products ──────────────────────────────────────────────────────────────

export interface ProductVariation {
  color: string;
  colorCode: string;
  colorImage: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  originPrice: number;
  brand?: string;
  gender?: string;
  type?: string;
  sold: number;
  quantity: number;
  isNew: boolean;
  onSale: boolean;
  rate: number;
  action?: string;
  category?: { id: string; name: string; slug: string };
  sizes: string[];
  variation: ProductVariation[];
  thumbImage: string[];
  images: string[];
  createdAt: string;
}

export interface ProductListResponse {
  products: Product[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

export interface ProductFilter {
  search?: string;
  category?: string;
  type?: string;
  gender?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
  page?: string;
  limit?: string;
  isNew?: string;
  onSale?: string;
}

export const productsApi = {
  getAll: async (filter: ProductFilter = {}): Promise<ProductListResponse> => {
    const cleanFilter: Record<string, string> = {};
    Object.entries(filter).forEach(([k, v]) => { if (v !== undefined) cleanFilter[k] = v; });
    const params = new URLSearchParams(cleanFilter);
    const res = await fetch(`${API_BASE}/products?${params}`);
    return handleResponse<ProductListResponse>(res);
  },

  getBySlug: async (slug: string): Promise<Product> => {
    const res = await fetch(`${API_BASE}/products/slug/${slug}`);
    return handleResponse<Product>(res);
  },

  getById: async (id: string): Promise<Product> => {
    const res = await fetch(`${API_BASE}/products/${id}`);
    return handleResponse<Product>(res);
  },

  getRelated: async (id: string): Promise<Product[]> => {
    const res = await fetch(`${API_BASE}/products/${id}/related`);
    return handleResponse<Product[]>(res);
  },
};

// ── Orders ────────────────────────────────────────────────────────────────

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface Order {
  id: string;
  status: string;
  total: number;
  discount: number;
  shipping: number;
  paymentMethod?: string;
  note?: string;
  couponCode?: string;
  createdAt: string;
  items: Array<OrderItem & { product: { name: string; images: string[] } }>;
  address?: Address;
}

export interface CreateOrderData {
  items: OrderItem[];
  addressId?: string;
  couponCode?: string;
  shipping?: number;
  paymentMethod?: string;
  note?: string;
  // Inline address fields (will be wrapped into address object before sending)
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  street?: string;
  postalCode?: string;
}

export const ordersApi = {
  create: async (data: CreateOrderData): Promise<Order> => {
    const { firstName, lastName, email, phone, country, city, street, postalCode, addressId, ...rest } = data;
    const payload: Record<string, unknown> = { ...rest };
    if (addressId) {
      payload.addressId = addressId;
    } else {
      payload.address = {
        name: [firstName, lastName].filter(Boolean).join(' ') || undefined,
        phone,
        street,
        city,
        state: undefined,
        postalCode,
        country,
      };
    }
    payload.email = email;
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<Order>(res);
  },

  getMine: async (): Promise<{ orders: Order[]; pagination: { total: number } }> => {
    const res = await fetch(`${API_BASE}/orders`, { headers: authHeaders() });
    return handleResponse<{ orders: Order[]; pagination: { total: number } }>(res);
  },

  getOne: async (id: string): Promise<Order> => {
    const res = await fetch(`${API_BASE}/orders/${id}`, { headers: authHeaders() });
    return handleResponse<Order>(res);
  },
};

// ── Coupons ───────────────────────────────────────────────────────────────

export interface CouponValidateResult {
  code: string;
  type: string;
  value: number;
  discount: number;
}

export const couponsApi = {
  validate: async (code: string, orderTotal: number): Promise<CouponValidateResult> => {
    const res = await fetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, orderTotal }),
    });
    return handleResponse<CouponValidateResult>(res);
  },
};

// ── Reviews ───────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: { name?: string; avatar?: string };
}

export interface ReviewListResponse {
  reviews: Review[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

export const reviewsApi = {
  getForProduct: async (productId: string, page = 1, limit = 10): Promise<ReviewListResponse> => {
    const res = await fetch(
      `${API_BASE}/reviews/product/${productId}?page=${page}&limit=${limit}`,
    );
    return handleResponse<ReviewListResponse>(res);
  },

  create: async (data: {
    productId: string;
    rating: number;
    comment?: string;
  }): Promise<Review> => {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Review>(res);
  },

  remove: async (reviewId: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse<void>(res);
  },
};

// ── Categories ────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const res = await fetch(`${API_BASE}/categories`);
    return handleResponse<Category[]>(res);
  },
};

// ── Product normalizer (API Product → frontend ProductType) ───────────────
// Converts an API product to the shape expected by existing UI components.
export function normalizeApiProduct(p: Product): import('@/type/ProductType').ProductType {
  const categoryName = typeof p.category === 'object' && p.category
    ? (p.category as { name: string }).name.toLowerCase()
    : (p.category as unknown as string | undefined) ?? '';
  return {
    id: p.id,
    category: categoryName,
    type: p.type ?? '',
    name: p.name,
    gender: p.gender ?? '',
    new: p.isNew,
    sale: p.onSale,
    rate: p.rate,
    price: p.price,
    originPrice: p.originPrice,
    brand: p.brand ?? '',
    sold: p.sold,
    quantity: p.quantity,
    quantityPurchase: 1,
    sizes: p.sizes,
    variation: p.variation,
    thumbImage: p.thumbImage,
    images: p.images,
    description: p.description ?? '',
    action: p.action ?? '',
    slug: p.slug,
  };
}

// ── Addresses ─────────────────────────────────────────────────────────────

export interface CreateAddressData {
  name: string;
  phone?: string;
  country: string;
  state?: string;
  city: string;
  street: string;
  postalCode?: string;
  isDefault?: boolean;
}

export const addressesApi = {
  getAll: async (): Promise<Address[]> => {
    const res = await fetch(`${API_BASE}/addresses`, { headers: authHeaders() });
    return handleResponse<Address[]>(res);
  },

  create: async (data: CreateAddressData): Promise<Address> => {
    const res = await fetch(`${API_BASE}/addresses`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Address>(res);
  },

  update: async (id: string, data: Partial<CreateAddressData>): Promise<Address> => {
    const res = await fetch(`${API_BASE}/addresses/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Address>(res);
  },

  remove: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/addresses/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse<void>(res);
  },
};

// ── Blog ──────────────────────────────────────────────────────────────────

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  tag?: string;
  author: string;
  avatar?: string;
  thumbImg?: string;
  coverImg?: string;
  shortDesc?: string;
  description: string;
  date: string;
  subImg: string[];
}

export interface BlogListResponse {
  data: BlogPost[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface BlogFilter {
  search?: string;
  category?: string;
  tag?: string;
  page?: string;
  limit?: string;
}

export const blogApi = {
  getAll: async (filter: BlogFilter = {}): Promise<BlogListResponse> => {
    const params = new URLSearchParams(filter as Record<string, string>);
    const res = await fetch(`${API_BASE}/blogs?${params}`);
    return handleResponse<BlogListResponse>(res);
  },

  getBySlug: async (slug: string): Promise<BlogPost> => {
    const res = await fetch(`${API_BASE}/blogs/${slug}`);
    return handleResponse<BlogPost>(res);
  },
};
