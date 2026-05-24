// core/models/api-response.model.ts

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  message: string;
  data: T[];
  totalElements?: number;
  totalPages?: number;
  currentPage?: number;
  pageSize?: number;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
}

export function isApiResponse(obj: any): obj is ApiResponse {
  return obj && typeof obj.success === 'boolean' && 'message' in obj;
}

export function isPaginatedResponse<T>(obj: any): obj is PaginatedResponse<T> {
  return obj && Array.isArray(obj.data) && typeof obj.totalElements === 'number';
}