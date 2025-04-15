// metro.config.js

const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    // Add proxy middleware here
    const proxy = require('http-proxy-middleware');

    // Set up the proxy for API requests
    middleware.use(
      '/api', // This is the endpoint you want to proxy
      proxy({
        target: 'https://www.oncohealthmart.com', // Target API URL
        changeOrigin: true,
        pathRewrite: {
          '^/api': '', // Rewrite '/api' to '' for the target API
        },
        secure: false, // Allow proxy to work with non-HTTPS targets if necessary
      })
    );

    return middleware;
  },
};

module.exports = config;