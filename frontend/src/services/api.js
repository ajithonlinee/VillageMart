import axios from 'axios';

const API = axios.create({
  baseURL: 'https://https://villagemart-9wtl.onrender.com.onrender.com/api/', // Paste Render URL here
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default API;