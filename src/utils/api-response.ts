class ApiResponse<T = unknown> {
    statusCode: number;
    data: T;
    message: string;
    success: boolean;

    constructor(statusCode: number, data: T = {} as T, message = "Success") {
        this.statusCode = Number(statusCode);
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}

export default ApiResponse;