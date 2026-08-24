// Server's response structure

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: true;
}

export interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors: unknown[];
}