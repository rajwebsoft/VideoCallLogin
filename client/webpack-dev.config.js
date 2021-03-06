const path = require('path');
const { DefinePlugin, HotModuleReplacementPlugin } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const socketConfig = require('../config.json');
const addBaseConfig = require('./webpack-base.config');

const configs = addBaseConfig({
  mode: 'development',
  output: {
    filename: 'js/[name].js'
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader?minimize=true', 'sass-loader']
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'assets',
              publicPath: '/'
            }
          }
        ]
      }
    ]
  },

  plugins: [
    new DefinePlugin({
      SOCKET_HOST: JSON.stringify(`localhost:${socketConfig.PORT}`)
    }),
    new HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      title: 'React VideoCallaa',
      filename: path.join(__dirname, 'index.html'),
      template: 'src/html/index.html'
    })
  ],
  devServer: {
    compress: false,
    port: 9000,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000
    }
  }
});

module.exports = configs;
