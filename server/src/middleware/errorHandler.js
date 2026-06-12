import AppError from '../utils/AppError.js';

export default function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message, errorCode: err.errorCode });
  }
  console.error(err);
  res.status(500).json({ success: false, message: 'Error del servidor', errorCode: 'SERVER_ERROR' });
}
