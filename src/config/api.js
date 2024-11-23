// Base API URL - adjust this to your backend URL
export const API_BASE_URL = 'http://localhost:3000/api';

// API endpoints configuration
export const endpoints = {
  categories: `${API_BASE_URL}/categories`,
  inventory: `${API_BASE_URL}/inventory`,
  suppliers: `${API_BASE_URL}/suppliers`,
  customers: `${API_BASE_URL}/customers`,
};

export const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
};