import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_BASE || '' });
console.log(process.env.REACT_APP_API_BASE)
export const fetchAll = (endpoint) => API.get(endpoint).then((res) => res.data);
export const createItem = (endpoint, data) => API.post(endpoint, data);
export const updateItem = (endpoint, id, data) => API.put(`${endpoint}/${id}`, data);
export const deleteItem = (endpoint, id) => API.delete(`${endpoint}/${id}`);
