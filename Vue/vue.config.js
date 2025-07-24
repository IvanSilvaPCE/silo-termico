module.exports = {
  lintOnSave: false,
  devServer: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: "all",
  }
  ,
  configureWebpack: {
    resolve: {
      alias: {
        "@": require("path").resolve(__dirname, "src"),
      },
    },
  },
};
