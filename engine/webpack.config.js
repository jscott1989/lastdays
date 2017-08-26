var debug = process.env.NODE_ENV !== "production";
var webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: [
    "./assets/js/index.js",
    "./assets/css/index.scss"
  ],
  output: {
    path: __dirname + "/static",
    filename: "bundle.js"
  },
  module: {
    loaders: [
            {test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'},
            {test: /\.scss$/, loader: ExtractTextPlugin.extract('css-loader!sass-loader')}
        ]
  },
  plugins: [
      new ExtractTextPlugin("style.css")
  ],
  resolve: {
      alias: {
          jquery: "jquery/src/jquery"
      }
  }
}