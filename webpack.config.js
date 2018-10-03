const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env, argv) => ({
  entry: "./src/main.ts",
  output: {
    path: path.resolve(__dirname, "dist/"),
    filename: "rey-ui.js",
    library: ["REY", "ui"],
    libraryTarget: "umd"
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  mode: argv.mode || "development",
  module: {
    rules: [
      { test: /\.ts$/, loader: "ts-loader", },
      { test: /\.css$/, loader: "css-loader", },
      { test: /\.svg$/, loader: "url-loader", },
      { test: /\.html$/, loader: "html-loader", },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: "./src/index.html", inject: "head" }),
  ],
});
