const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = env => {
  const dev = env.NODE_ENV === 'development'

  const game = {
    devServer: {
      https: true,
      host: '0.0.0.0'
    },
    entry: {
      sounds: {
        import: ['./src/soundtrack.js', './src/sounds.js']
      },
      game: {
        import: './src/game.js',
        dependOn: ['sounds']
      }
    },
    output: {
      publicPath: '',
      chunkFilename: '[name].js',
      filename: '[name].js'
    },
    module: {
      rules: [
        {
          test: /\.(png|jpe?g|gif)$/i,
          // include: path.resolve(__dirname, 'src/sprites'),
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]'
          }
        },
        {
          test: /\.js$/,
          include: path.resolve(__dirname, 'src'),
          exclude: /node_modules/,
          use: ['babel-loader']
        }
      ]
    },
    mode: dev ? 'development' : 'production',
    devtool: dev ? 'eval-cheap-source-map' : false,
    cache: dev,
    watchOptions: {
      poll: 5000
    },
    optimization: dev ? {} : {
      minimize: true,
      minimizer: [new UglifyJsPlugin({
        comments: false,
        include: /\.min\.js$/
      })]
    },
    plugins: [
      new HtmlWebpackPlugin({
        chunks: ['sound', 'game'],
        inject: 'head',
        scriptLoading: 'defer',
        excludeChunks: ['mapCreator', 'spritePreview'],
        template: './src/game.html'
      })
    ]
  }

  const supporters = {
    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      index: 'supporters.html',
      https: true,
      host: '0.0.0.0'
    },
    entry: [
      './src/supporters.html'
    ],
    output: {
      publicPath: '',
      // path: path.join(__dirname, '/dist/'),
      // chunkFilename: '[name].js',
      // filename: '[name].js'
    },
    module: {
      rules: [
        {
          test: /\.html$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]'
              }
            },
            'extract-loader',
            'html-loader'
          ]
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: ['babel-loader']
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: 'assets/[name].[ext]'
              }
            },
            'extract-loader',
            {
              loader: 'css-loader',
              options: {
                url: false
              }
            },
            'postcss-loader'
          ]
        },
        {
          test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]'
          }
        },
        {
          test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
          type: 'asset/resource',
        },
      ]
    },
    mode: dev ? 'development' : 'production',
    devtool: 'eval-source-map',
    cache: dev,
    watchOptions: {
      poll: 5000
    },
    optimization: dev ? {} : {
      minimize: true,
      minimizer: [new UglifyJsPlugin({
        include: /\.min\.js$/
      })]
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: './src/assets/fonts', to: 'assets/fonts' },
          { from: './src/assets/banner.png', to: 'assets/banner.png' }
        ]
      })
    ]
  }

  const teaser = {
    devServer: {
      https: true,
      host: '0.0.0.0'
    },
    entry: {
      teaser: {
        import: './src/teaser.js'
      }
    },
    output: {
      publicPath: '',
      chunkFilename: '[name].js',
      filename: '[name].js'
    },
    module: {
      rules: [
        {
          test: /\.(png|jpe?g|gif)$/i,
          // include: path.resolve(__dirname, 'src/sprites'),
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]'
          }
        },
        {
          test: /\.js$/,
          include: path.resolve(__dirname, 'src'),
          exclude: /node_modules/,
          use: ['babel-loader']
        }
      ]
    },
    mode: dev ? 'development' : 'production',
    cache: dev,
    watchOptions: {
      poll: 5000
    },
    optimization: dev ? {} : {
      minimize: true,
      minimizer: [new UglifyJsPlugin({
        include: /\.min\.js$/
      })]
    },
    plugins: [
      new HtmlWebpackPlugin({
        chunks: ['teaser'],
        template: './src/teaser.html'
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
      publicPath: '',
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
      publicPath: '',
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

  return env.BUNDLE === 'game'
    ? game
    : env.BUNDLE === 'mapCreator'
    ? mapCreator
    : env.BUNDLE === 'spriteViewer'
    ? spriteViewer
    : env.BUNDLE === 'supporters'
    ? supporters
    : env.BUNDLE === 'teaser'
    ? teaser
    : game
}