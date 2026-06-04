import axios from 'axios';

const API = axios.create({
  baseURL: 'https://villagemart-9wtl.onrender.com', // Your live backend URL
  timeout: 15000, 
  headers: {
    'Content-Type': 'application/json',
  }
});

export default API;