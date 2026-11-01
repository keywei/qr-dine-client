import axios, { AxiosError } from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiResponse } from '@/types';
import { showToast } from 'vant';
import { codeToMessage } from '@/errorCode';

const SUCCESS_CODE = [0];
const BUSINESS_ERROR = 'BUSINESS_ERROR';

const instance = axios.create({
	baseURL: '/api',
	timeout: 10000
});

const errorHandle = (error: AxiosError<ApiResponse>) => {
	let throwError = error;
	switch (error.status) {
		case 200:
			throwError = codeToMessage(error, error.response?.data?.code);
			break;
		case 404:
		case 500:
		case 502:
			throwError = codeToMessage(error, error.status);
			break;
		default:
			throwError = error;
			break;
	}
	if (!error?.config?.silent) showToast({ type: 'fail', message: throwError.message });
	return Promise.reject(error);
};

instance.interceptors.response.use((response: AxiosResponse<ApiResponse<unknown>>) => {
	const { data } = response;
	const { code } = data;
	if (SUCCESS_CODE.includes(code)) return response;
	return errorHandle(new AxiosError('Business error', BUSINESS_ERROR, response.config, response.request, response));
}, errorHandle);

const api = {
	async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
		const res = await instance.get<ApiResponse<T>>(url, config);
		return res.data.data;
	},
	async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
		const res = await instance.post<ApiResponse<T>>(url, data, config);
		return res.data.data;
	},
	async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
		const res = await instance.put<ApiResponse<T>>(url, data, config);
		return res.data.data;
	},
	async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
		const res = await instance.delete<ApiResponse<T>>(url, config);
		return res.data.data;
	}
};

export default api;
