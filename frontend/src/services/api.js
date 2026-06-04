import axios from 'axios';

// Configure global instance pointing to our running Django backend server
const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default API;