import axios from 'axios';

const isLocalDevelopment =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (isLocalDevelopment
    ? 'http://localhost:5000/api'
    : 'https://loans-fw8w.onrender.com/api');

const API = axios.create({
  baseURL: API_BASE_URL,
});

export default API;
