const DATABASE_ERROR_NAMES = new Set([
  "MongoServerSelectionError",
  "MongoNetworkError",
  "MongoNetworkTimeoutError",
  "MongoNotConnectedError",
  "MongoTimeoutError",
  "MongoServerClosedError",
  "MongooseServerSelectionError",
]);

const isDatabaseConnectionError = (err) => {
  if (DATABASE_ERROR_NAMES.has(err.name)) return true;

  const message = err.message || "";

  return (
    message.includes("server monitor timeout") ||
    message.includes("connection timed out") ||
    message.includes("ECONNREFUSED") ||
    (message.includes("ENOTFOUND") && message.toLowerCase().includes("mongo"))
  );
};

const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  if (isDatabaseConnectionError(err)) {
    return res.status(503).json({
      success: false,
      message: "Unable to reach the database. Please try again.",
    });
  }

  const statusCode = err.statusCode || (err.name === "MulterError" ? 400 : 500);
  const message = err.statusCode || err.name === "MulterError"
    ? err.message
    : "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
  });
};

export default errorMiddleware;