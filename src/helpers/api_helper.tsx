import axios from "axios";

const API_URL = "https://api.tickleright.in/api";

const axiosApi = axios.create({
  baseURL: API_URL,
});

// ✅ Add dynamic token per request
axiosApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // or sessionStorage
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

axiosApi.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

axiosApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = '/auth/signin';
    }
    return Promise.reject(error);
  }
);

export async function get(url, config = {}) {
  return await axiosApi.get(url, config).then((res) => res.data);
}

export async function post(url, data, config = {}) {
  return await axiosApi.post(url, data, config).then((res) => res.data);
}

export async function put(url, data, config = {}) {
  return await axiosApi.put(url, data, config).then((res) => res.data);
}

export async function del(url, config = {}) {
  return await axiosApi.delete(url, config).then((res) => res.data);
}
