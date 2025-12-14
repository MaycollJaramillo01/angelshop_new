import http from './http';

export async function fetchProducts(params = {}) {
  const { data } = await http.get('/api/products', { params });
  return data;
}

export async function fetchProduct(slug) {
  const { data } = await http.get(`/api/products/${slug}`);
  return data;
}
