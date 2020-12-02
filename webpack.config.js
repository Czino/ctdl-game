const HtmlWebpackPlugin = require('html-webpack-plugin');
const glob = require('glob')
const game = {
  devServer: {
    https: true,
    host: '0.0.0.0'
  },
  entry: {
    game: './src/game.js'
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
      }
    ]
  },
  devtool: 'inline-source-map',
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['game'],
      excludeChunks: ['mapCreator', 'spritePreview'],
      template: './src/game.html'
    })
  ]
}

const soundtracks = {
  entry: glob.sync('./src/tracks/**/index.js').reduce((obj, path) => {
    let name = path.split('/')
    name = name[name.length - 2]
    obj[name] = path
    return obj
  },{}),
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
    ]
  },
  output: {
    filename: 'tracks/[name].js'
  }
}
const mapCreator = {
  devServer: {
    https: true,
    host: '0.0.0.0'
  },
  entry: {
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
      }
    ]
  },
  devtool: 'inline-source-map',
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
    host: '0.0.0.0'
  },
  entry: {
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
      }
    ]
  },
  devtool: 'inline-source-map',
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
  soundtracks,
  // mapCreator,
  // spriteViewer
]