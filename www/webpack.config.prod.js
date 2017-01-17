const fs = require('fs');
const cheerio = require('cheerio');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackProcessingPlugin = require('html-webpack-processing-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const WebpackCleanupPlugin = require('webpack-cleanup-plugin');
const OptimizeJsPlugin = require("optimize-js-plugin");
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

let config = {};

if (fs.existsSync('./static_src/config.js')) {
  config = require('./static_src/config.js');
}

module.exports = {
  devtool: 'source-map',
  debug: true,
  entry: {
    app: './static_src/scripts/app.js'
  },
  output: {
    path: 'static',
    filename: '[name].[hash].bundle.js',
    sourceMapFilename: '[name].[hash].map'
  },
  resolve: {
    extensions: ['', '.js', '.less', '.css', '.html']
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        query: {
          presets: ['es2015'],
          plugins: ['syntax-decorators', 'ng-annotate', 'lodash']
        },
        exclude: /node_modules/
      },
      { test: /\.json$/, loader: 'json' },
      { test: /\.html$/, loader: 'raw' },
      { test: /\.less$/, loader: 'style!css!less' },
      { test: /\.css$/, loader: ExtractTextPlugin.extract('style', 'css') },
      { test: /\.(png|gif|jpg)$/, loaders: ['file?name=images/[name].[ext]', 'image-webpack'] },
      // For font-awesome, created by Turbo87:
      // https://gist.github.com/Turbo87/e8e941e68308d3b40ef6
      { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: 'file?name=fonts/[name].[ext]' },
      { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: 'file?name=fonts/[name].[ext]' },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'file?name=fonts/[name].[ext]' },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file?name=fonts/[name].[ext]' },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'file?name=fonts/[name].[ext]' }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      mangle: false
    }),
    new webpack.NoErrorsPlugin(),
    new webpack.ProvidePlugin({
      Pbf: 'pbf',
      vectorTile: 'vector-tile',
      d3: 'd3'
    }),
    new ExtractTextPlugin('[name].[contenthash].css'),
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require('cssnano'),
      cssProcessorOptions: { discardComments: {removeAll: true } },
      canPrint: true
    }),
    new HtmlWebpackPlugin({
      template: './static_src/views/index.html',
      inject: true,
      postProcessing: addGoogleAnalytics
    }),
    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: 'defer'
    }),
    new WebpackCleanupPlugin(),
    new OptimizeJsPlugin({
      sourceMap: true
    }),
    new LodashModuleReplacementPlugin({
      shorthands: true,
      cloning: true,
      collections: true,
      paths: true,
      flattening: true
    }),
    new HtmlWebpackProcessingPlugin()
  ]
};

function addGoogleAnalytics(html) {
  if (!config.googleAnalyticsID) { return html; }

  let $ = cheerio.load(html);
  let analytics = `
    <script>
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

      ga('create', '${config.googleAnalyticsID}', 'auto');
      ga('send', 'pageview');
    </script>
  `;

  $('head').append(analytics);

  return $.html();
}
