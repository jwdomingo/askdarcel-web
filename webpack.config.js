var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtendedDefinePlugin = require('extended-define-webpack-plugin');

//Change this to config.js and add a key to the config file
var config = require(path.resolve(__dirname, 'app/utils/config.example.js'));

var appRoot = path.resolve(__dirname, 'app/');
var buildDir = path.resolve(__dirname, 'build');

module.exports = {
  context: __dirname,
  entry: path.resolve(appRoot, 'init.js'),
  output: {
    path: buildDir,
    publicPath: '/dist/',
    filename: 'bundle.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Ask Darcel',
      template: 'app/index.html'
    }),
    new ExtendedDefinePlugin({
      CONFIG: config
    })
  ],
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: [/node_modules/, /typings/],
        query: {
          presets: ['es2015', 'react']
        }
      },
      {
        test: /\.scss$/,
        loaders: ['style', 'css', 'sass']
      },
      {
        test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        loader: 'file-loader?name=fonts/[name].[ext]'
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          'file?name=[name]-[sha512:hash:hex:8].[ext]',
          'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
        ]
      },
      {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  },
  devServer: {
    contentBase: buildDir,
    historyApiFallback: true,
    devtool: 'source-map',
    colors: true,
    proxy: {
      '/api/*': {
        target: process.env.API_URL || 'http://localhost:3000',
        rewrite: function(req) {
          req.url = req.url.replace(/^\/api/, '');
        }
      }
    }
  }
};


