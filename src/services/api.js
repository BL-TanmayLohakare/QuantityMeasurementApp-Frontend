import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/quantity';

const getAuthHeaders = () => {
  const token = localStorage.getItem('jwt_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export const convertQuantity = async (payload) => {
  const response = await axios.post(`${API_BASE_URL}/convert`, payload, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const compareQuantities = async (payload) => {
  const response = await axios.post(`${API_BASE_URL}/compare`, payload, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const addQuantities = async (payload) => {
  const response = await axios.post(`${API_BASE_URL}/add`, payload, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const subtractQuantities = async (payload) => {
  const response = await axios.post(`${API_BASE_URL}/subtract`, payload, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const login = async (payload) => {
  const response = await axios.post(`http://localhost:8080/api/auth/login`, payload);
  return response.data;
};

export const signup = async (payload) => {
  const response = await axios.post(`http://localhost:8080/api/auth/signup`, payload);
  return response.data;
};
