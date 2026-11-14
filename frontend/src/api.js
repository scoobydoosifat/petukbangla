const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9092/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('petuk-token');
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'অনুরোধটি সম্পন্ন করা যায়নি।');
  }
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  verifyEmail: (token) => request('/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }) }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token, password) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
  me: () => request('/auth/me'),
  foods: () => request('/foods'),
  places: () => request('/places'),
  createPlace: (body) => request('/places', { method: 'POST', body: JSON.stringify(body) }),
  deletePlace: (id) => request(`/places/${id}`, { method: 'DELETE' }),
  changePassword: (body) => request('/users/me/password', { method: 'PUT', body: JSON.stringify(body) }),
  deleteAccount: (body) => request('/users/me', { method: 'DELETE', body: JSON.stringify(body) }),
};
