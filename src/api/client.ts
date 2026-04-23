import type { ApiResponse } from '@/types';
import axios, { AxiosError, type AxiosRequestConfig } from 'axios';

export class ApiError extends Error {
  code?: string;
  status: number;
  errors?: unknown;

  constructor(message: string, status: number, code?: string, errors?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
const ACCESS_TOKEN_KEY = 'accessToken';

type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue>;

function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

type RequestOptions = Omit<AxiosRequestConfig, 'data' | 'params'> & {
  body?: unknown;
  query?: QueryParams;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  let payload: (ApiResponse<T> & { errors?: unknown }) | null = null;
  try {
    const response = await axios.request<ApiResponse<T>>({
      ...options,
      baseURL: API_BASE_URL,
      url: path,
      params: sanitizeQuery(options.query),
      data: options.body,
      headers: {
        ...(options.headers ?? {}),
        ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {}),
      },
    });
    payload = response.data as ApiResponse<T> & { errors?: unknown };
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<T> & { errors?: unknown }>;
    const status = axiosError.response?.status ?? 500;
    const errorPayload = axiosError.response?.data;
    throw new ApiError(
      errorPayload?.message ?? axiosError.message ?? `Request failed with status ${status}`,
      status,
      errorPayload?.code,
      errorPayload?.errors
    );
  }

  if (!payload?.success) {
    throw new ApiError(payload?.message ?? 'Request failed.', 400, payload?.code, payload?.errors);
  }

  return payload;
}

function sanitizeQuery(query?: QueryParams): QueryParams | undefined {
  if (!query) {
    return undefined;
  }
  const output: QueryParams = {};
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined || value === '') {
      continue;
    }
    output[key] = value;
  }
  return output;
}
