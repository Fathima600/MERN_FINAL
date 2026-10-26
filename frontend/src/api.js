const API_ROOT = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_ROOT}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
    });
  } catch {
    throw new Error('Cannot reach the API. Make sure the backend is running on port 5000.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'The request could not be completed.');
  return data;
}

export const getFeedback = () => request('/feedback');
export const createFeedback = (payload) => request('/feedback', { method: 'POST', body: JSON.stringify(payload) });
export const updateFeedback = (id, payload) => request(`/feedback/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const deleteFeedback = (id) => request(`/feedback/${id}`, { method: 'DELETE' });
