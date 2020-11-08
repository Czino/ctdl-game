const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devServer: {
    https: true,
    host: '0.0.0.0'
  },
  entry: {
    game: './src/game.js',
    mapCreator: './src/mapCreator.js'
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/i,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]'
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      // {
      //   test: /\.html$/,
      //   exclude: /node_modules/,
      //   use: ['html-loader']
      // }
    ]
  },
  // optimization: {
  //   splitChunks: {
  //     chunks: 'all',
  //   },
  // },
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['game'],
      template: './src/game.html'
    }),
    // new HtmlWebpackPlugin({
    //   chunks: ['mapCreator'],
    //   excludeChunks: ['game'],
    //   template: './src/mapCreator.html'
    // })
  ]
};