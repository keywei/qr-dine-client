import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    silent?: boolean; // 是否靜默模式（為 true 時不彈出錯誤 Toast，預設 false）
  }
  export interface InternalAxiosRequestConfig {
    silent?: boolean;
  }
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  code: number;
}
