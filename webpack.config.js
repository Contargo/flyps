const path = require("path");

module.exports = {
  devtool: "source-map",
  entry: path.resolve(__dirname, "src", "index.js"),
  output: {
    filename: "flyps.js",
    path: path.resolve(__dirname, "dist"),
    library: "flyps",
    libraryTarget: "umd"
  },
  module: {
    rules: [{ test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }]
  }
};
