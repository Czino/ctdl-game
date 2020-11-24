const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devServer: {
    https: true,
    host: '0.0.0.0'
  },
  entry: {
    game: './src/game.js',
    mapCreator: './src/mapCreator.js',
    spritePreview: './src/spritePreview.js'
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
      excludeChunks: ['mapCreator', 'spritePreview'],
      template: './src/game.html'
    }),
    // new HtmlWebpackPlugin({
    //   chunks: ['mapCreator'],
    //   excludeChunks: ['game', 'spritePreview'],
    //   template: './src/mapCreator.html'
    // }),
    new HtmlWebpackPlugin({
        chunks: ['spritePreview'],
        excludeChunks: ['game', 'mapCreator'],
        template: './src/spritePreview.html'
      })
  ]
};