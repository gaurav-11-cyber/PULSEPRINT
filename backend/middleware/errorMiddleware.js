function notFound(req, res, _next) {
  res.status(404).json({
    ok: false,
    error: "Not Found",
    path: req.originalUrl,
  });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json({
    ok: false,
    error: err?.message || "Server Error",
  });
}

module.exports = { notFound, errorHandler };

