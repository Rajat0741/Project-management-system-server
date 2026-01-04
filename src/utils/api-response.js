class ApiResponse {
    constructor(statusCode, data = {}, message = "Success") {
        this.statusCode = Number(statusCode);
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}

export default ApiResponse;