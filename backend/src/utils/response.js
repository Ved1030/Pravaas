exports.success = (res, message, data = null, statusCode = 200) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

exports.error = (res, message, error = null, statusCode = 500) => {
  const response = { success: false, message };
  if (error !== null) response.error = error;
  return res.status(statusCode).json(response);
};
