import axios from 'axios';
import { showToast } from 'vant';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || '網路連線失敗，請稍後再試';
    showToast({ type: 'fail', message });
    return Promise.reject(error);
  }
);

export default api;

