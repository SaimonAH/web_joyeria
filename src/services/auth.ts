import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const login = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/usuarios/login`, { email, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('userRole', response.data.usuario.rol);
    localStorage.setItem('userId', response.data.usuario.id);
    localStorage.setItem('userInfo', JSON.stringify(response.data.usuario));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userId');
  localStorage.removeItem('userInfo');
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

export const getUserInfo = () => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo) : null;
};

export const getUserRole = () => {
  return localStorage.getItem('userRole');
};