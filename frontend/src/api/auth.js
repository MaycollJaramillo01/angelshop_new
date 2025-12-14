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
