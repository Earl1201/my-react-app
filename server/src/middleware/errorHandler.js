export const errorHandler = (err, _req, res, _next) => {
  console.error("Unhandled error:", err);

  // MySQL duplicate entry
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ error: "A record with that value already exists." });
  }

  const status = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message : "Something went wrong. Please try again.";
  res.status(status).json({ error: message });
};
