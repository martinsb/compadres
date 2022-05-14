const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/todows", {
      target: "ws://localhost:3003",
      ws: true,
    })
  );
};
