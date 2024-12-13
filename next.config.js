const withTM = require("next-transpile-modules")([
  "@mui/material",
  "@mui/icons-material",
  "@mui/system",
]);

module.exports = withTM({
  reactStrictMode: true,
  swcMinify: true, // Désactive SWC
  webpack(config, { isServer }) {
    if (!isServer) {
      config.module.rules.push({
        test: /\.(js|ts|tsx)$/,
        loader: "babel-loader", // Utiliser babel-loader
        exclude: /node_modules/,
      });
    }
    return config;
  },
});
