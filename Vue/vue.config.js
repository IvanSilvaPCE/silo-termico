module.exports = {
  devServer: {
    host: "0.0.0.0",
    port: 5000,
    disableHostCheck: true,
  },
  configureWebpack: {
    resolve: {
      alias: {
        "@": require("path").resolve(__dirname, "src"),
      },
    },
  },
};
