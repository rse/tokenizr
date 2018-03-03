var path = require("path");

module.exports = {
  entry: {
    main: "./src/testEntry.js"
  },
  output: {
    filename: "[name]-bundle.js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "commonjs" //temporary
  },
  mode: true || process.env.NODE_ENV == "production" ? "production" : "development",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        query: {
          presets: ["es2015"],
          plugins: ["transform-object-rest-spread"]
        }
      }
    ]
  }
};
