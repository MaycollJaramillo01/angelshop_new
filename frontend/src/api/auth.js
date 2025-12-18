import http from './http';

export async function requestOtp(email) {
  const { data } = await http.post('/api/otp/request', { email });
  return data;
}

export async function verifyOtp(email, code) {
  const { data } = await http.post('/api/otp/verify', { email, code });
  return data;
}

export async function adminLogin(email, password) {
  const { data } = await http.post('/api/admin/login', { email, password });
  return data;
}

export async function fetchAdminProducts(token) {
  const { data } = await http.get('/api/admin/products', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

export async function fetchAdminReservations(token) {
  const { data } = await http.get('/api/admin/reservations', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

export async function updateReservationStatus(token, code, status) {
  const { data } = await http.patch(
    `/api/admin/reservations/${code}/status`,
    { status },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}

export async function fetchReports(token) {
  const { data } = await http.get('/api/admin/reports/summary', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

export async function createProduct(token, productData) {
  const { data } = await http.post('/api/admin/products', productData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

export async function updateProduct(token, productId, productData) {
  const { data } = await http.put(`/api/admin/products/${productId}`, productData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

export async function deleteProduct(token, productId) {
  const { data } = await http.delete(`/api/admin/products/${productId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

export async function updateProductStock(token, productId, variantSku, delta) {
  const { data } = await http.patch(
    `/api/admin/products/${productId}/stock`,
    { variantSku, delta },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}

export async function fetchProductById(token, productId) {
  try {
    const products = await fetchAdminProducts(token);
    const product = products.find(p => p._id === productId);
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}