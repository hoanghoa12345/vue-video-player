const responseSuccess = (res, statusCode = 200, data, message) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export { responseSuccess };
