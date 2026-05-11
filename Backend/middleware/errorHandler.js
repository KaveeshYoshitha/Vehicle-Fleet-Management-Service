export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // MySQL duplicate entry error
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      message: 'A record with that value already exists.',
      error: err.message,
    });
  }

  // MySQL foreign key constraint error
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      message: 'Referenced record does not exist.',
      error: err.message,
    });
  }

  // Validation error
  if (err.status === 400) {
    return res.status(400).json({
      message: err.message || 'Bad request.',
    });
  }

  // Default server error
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error.',
  });
};
