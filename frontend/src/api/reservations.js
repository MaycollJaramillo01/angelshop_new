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
