export class ApiError extends Error {
  constructor(message, errorCode, status) {
    super(message);
    this.name = 'ApiError';
    this.errorCode = errorCode;
    this.status = status;
  }
}
