export interface ApiError {
  error: string;
  message: string;
  request_id?: string;
  timestamp?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}
