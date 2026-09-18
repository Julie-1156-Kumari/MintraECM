import axios from 'axios';

const isLocalHostUrl = (value) => /localhost|127\.0\.0\.1/i.test(value);

const resolveApiBaseUrl = () => {
  const configured = String(import.meta.env.VITE_API_URL || '').trim();

  if (import.meta.env.PROD) {
    if (!configured) {
      throw new Error(
        'VITE_API_URL is required in production. Set it to your Render API URL (e.g. https://your-service.onrender.com/api).'
      );
    }
    if (isLocalHostUrl(configured)) {
      throw new Error(
        'VITE_API_URL must not point to localhost in a production build.'
      );
    }
  }

  if (!configured) {
    // Vite proxies /api -> http://localhost:5001 during local development.
    return '/api';
  }

  let url = configured.replace(/\/+$/, '');
  if (url.endsWith('/api/api')) {
    url = url.slice(0, -4);
  }
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
};

const axiosInstance = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 15001,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Something went wrong';

    return Promise.reject({
      ...error,
      message,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

export default axiosInstance;
