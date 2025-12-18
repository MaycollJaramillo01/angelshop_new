import http from './http';

export async function createReservation(token, items) {
  const { data } = await http.post(
    '/api/reservations',
    { items },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return { data };
}

export async function fetchMyReservations(token) {
  const { data } = await http.get('/api/reservations/my', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

export async function cancelReservation(token, code) {
  const { data } = await http.post(
    `/api/reservations/${code}/cancel`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}

export async function createReservationDirect(data) {
  const { data: response } = await http.post('/api/reservations/direct', data);
  return response;
}

export async function fetchReservationByEmail(email) {
  const { data } = await http.get(`/api/reservations/by-email/${encodeURIComponent(email)}`);
  return data;
}
