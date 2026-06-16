const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include',
  };

  const response = await fetch(url, config);
  if (!response.ok) {
    let errMsg = 'Terjadi kesalahan sistem';
    try {
      const errData = await response.json();
      errMsg = errData.message || errMsg;
    } catch (e) {}
    throw new Error(errMsg);
  }

  return response.json();
}

export const api = {
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  loginWithGoogle: (idToken) => request('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  }),
  register: (payload) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  registerWithGoogle: (payload) => request('/auth/register/google', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  me: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),
  updateProfile: (payload) => request('/auth/profile/update', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  becomeSeller: (payload) => request('/auth/become-seller', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  getProducts: (kategori = '', search = '', sortBy = '') => {
    const params = new URLSearchParams();
    if (kategori) params.append('kategori', kategori);
    if (search) params.append('search', search);
    if (sortBy) params.append('sortBy', sortBy);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/products${query}`);
  },
  getProductDetail: (productId) => request(`/products/detail?productId=${productId}`),

  getBuyerDashboard: () => request('/buyer/dashboard'),
  addToCart: (productId) => request('/cart/add', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  }),
  removeFromCart: (productId) => request('/cart/remove', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  }),
  checkout: (payload) => request('/cart/checkout', {
    method: 'POST',
    body: payload ? JSON.stringify(payload) : undefined,
  }),

  getPaymentDetails: (transactionId) => request(`/payment?transactionId=${transactionId}`),
  processPayment: (transactionId, amount) => request('/payment/process', {
    method: 'POST',
    body: JSON.stringify({ transactionId, amount }),
  }),
  cancelOrder: (transactionId) => request('/orders/cancel', {
    method: 'POST',
    body: JSON.stringify({ transactionId }),
  }),
  completeOrder: (transactionId) => request('/orders/complete', {
    method: 'POST',
    body: JSON.stringify({ transactionId }),
  }),

  addReview: (payload) => request('/review/add', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  readNotifications: (notificationId = null) => request('/notifications/read', {
    method: 'POST',
    body: notificationId ? JSON.stringify({ notificationId }) : undefined,
  }),

  getSellerDashboard: () => request('/seller/dashboard'),
  addProduct: (payload) => request('/product/add', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updateProduct: (payload) => request('/product/edit', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  deleteProduct: (id) => request('/product/delete', {
    method: 'POST',
    body: JSON.stringify({ id }),
  }),
  updateOrderStatus: (transactionId, status) => request('/orders/update', {
    method: 'POST',
    body: JSON.stringify({ transactionId, status }),
  }),
  replyReview: (reviewId, replyText) => request('/review/reply', {
    method: 'POST',
    body: JSON.stringify({ reviewId, replyText }),
  }),

  // Admin APIs
  getAdminDashboard: () => request('/admin/dashboard'),
  deleteUserByAdmin: (userId) => request('/admin/users/delete', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  }),
  blockUserByAdmin: (userId) => request('/admin/users/block', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  }),
  deleteProductByAdmin: (productId) => request('/admin/product/delete', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  }),
  getShops: (category = '') => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/shops${query}`);
  },
  getShopDetail: (shopId) => request(`/shops/${shopId}`),
};

export const showAlert = (title, text, icon = 'success') => {
  if (typeof window !== 'undefined' && window.Swal) {
    return window.Swal.fire({
      title,
      text,
      icon,
      confirmButtonColor: '#00aa5b',
    });
  } else {
    alert(text || title);
    return Promise.resolve();
  }
};

export const showConfirm = (title, text) => {
  if (typeof window !== 'undefined' && window.Swal) {
    return window.Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#00aa5b',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Batal',
    }).then((result) => result.isConfirmed);
  } else {
    return Promise.resolve(confirm(text || title));
  }
};
