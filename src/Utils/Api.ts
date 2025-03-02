import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: "https://chat-app-backend-9q4s.onrender.com/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
