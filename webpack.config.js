const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const entry = {
  game: {
    import: './src/game.js'
  }
}
console.log(entry)

const game = {
  devServer: {
    https: true,
    host: '0.0.0.0'
  },
  entry,
  output: {
    publicPath: '/',
    chunkFilename: '[name].js',
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/i,
        include: path.resolve(__dirname, 'src/sprites'),
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]'
        }
      },
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        exclude: [
          /node_modules/,
          path.resolve(__dirname, 'src/tracks')
        ],
        use: ['babel-loader']
      },
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src/tracks'),
        exclude: /node_modules/,
        use: ['babel-loader']
      },
    ]
  },
  devtool: 'eval-cheap-source-map',
  cache: true,
  watchOptions: {
    poll: 5000
  },
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['game'],
      excludeChunks: ['mapCreator', 'spritePreview'],
      template: './src/game.html'
    })
  ]
}

const mapCreator = {
  devServer: {
    https: true,
    contentBase: path.join(__dirname, 'dist'),
    host: '0.0.0.0'
  },
  entry: {
    mapCreator: './src/mapCreator.js'
  },
  output: {
    publicPath: '/dist/',
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/i,
        include: path.resolve(__dirname, 'src/sprites'),
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]'
        }
      },
      {
        test: /\.js$/,
        exclude: [
          /node_modules/,
          path.resolve(__dirname, 'src/tracks')
        ],
        use: ['babel-loader']
      }
    ]
  },
  devtool: 'eval-cheap-source-map',
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['mapCreator'],
      excludeChunks: ['game', 'spritePreview'],
      template: './src/mapCreator.html'
    }),
  ]
}
const spriteViewer = {
  devServer: {
    https: true,
    contentBase: path.join(__dirname, 'dist'),
    host: '0.0.0.0'
  },
  entry: {
    spritePreview: './src/spritePreview.js'
  },
  output: {
    publicPath: '/dist/',
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/i,
        include: path.resolve(__dirname, 'src/sprites'),
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]'
        }
      },
      {
        test: /\.js$/,
        exclude: [
          /node_modules/,
          path.resolve(__dirname, 'src/tracks')
        ],
        use: ['babel-loader']
      }
    ]
  },
  devtool: 'eval-cheap-source-map',
  plugins: [
    new HtmlWebpackPlugin({
        chunks: ['spritePreview'],
        excludeChunks: ['game', 'mapCreator'],
        template: './src/spritePreview.html'
      })
  ]
}

module.exports = [
  game,
  // mapCreator,
  // spriteViewer
]