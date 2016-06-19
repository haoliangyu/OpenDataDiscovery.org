var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var srcDir = 'static_src';
var outputDir = 'static';

module.exports = {
  devtool: 'source-map',
  debug: true,
  entry: {
    app: path.resolve(srcDir, 'scripts/app.js')
  },
  output: {
    path: outputDir,
    filename: '[name].bundle.js',
    sourceMapFilename: '[name].map',
    chunkFilename: '[id].chunk.js'
  },
  resolve: {
    extensions: ['', '.js', '.less', '.css', '.html'],
    alias: {
      'webworkify': 'webworkify-webpack',
      'mapbox-gl': path.resolve('../node_modules/mapbox-gl/dist/mapbox-gl.js')
    }
  },
  eslint: {
    configFile: '../.eslintrc.js',
    quiet: true,
    failOnError: true
  },
  module: {
    preLoaders: [
      {test: /\.js$/, loader: "eslint-loader", exclude: /node_modules/}
    ],
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        query: {
          presets: ['es2015'],
          plugins: ['syntax-decorators', 'ng-annotate']
        },
        exclude: /node_module/
      },
      {
        test: /\.js$/,
        include: path.resolve('../node_modules/mapbox-gl-shaders/index.js'),
        loaders: ['transform/cacheable?brfs']
      },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.html$/, loader: 'raw' },
      { test: /\.less$/, loader: 'style!css!less' },
      { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader') },
      { test: /\.(png|gif|jpg)$/, loader: 'file?name=images/[name].[ext]' },
      // For font-awesome, created by Turbo87:
      // https://gist.github.com/Turbo87/e8e941e68308d3b40ef6
      { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: 'file?name=fonts/[name].[ext]' },
      { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: 'file?name=fonts/[name].[ext]' },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'file?name=fonts/[name].[ext]' },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file?name=fonts/[name].[ext]' },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'file?name=fonts/[name].[ext]' }
    ],
    postLoaders: [
      {
        include: /node_modules\/mapbox-gl-shaders/,
        loader: 'transform',
        query: 'brfs'
      }
    ]
  },
  plugins: [
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.DedupePlugin(),
    new ExtractTextPlugin('[name].css'),
    new HtmlWebpackPlugin({
      template: path.resolve(srcDir, 'views/index.html'),
      inject: true
    })
  ]
};
