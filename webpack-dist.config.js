const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const base = require('./webpack.base.js');
const webpack = require('webpack');
const merge = require('deepmerge');
const options = require('./options');

const config = merge(
  base,
  {
    entry: {
      Background: ['./src/Background.vue'],
      Img: ['./src/Img.vue'],
      CloudImageProvider: ['./src/Provider.vue']
    },
    output: {
      path: path.join(__dirname, 'dist'),
      filename: options.isProduction ? '[name].min.js' : '[name].js',
      library: ['vue-cloudimage-responsive-plain', '[name]'],
      libraryTarget: 'umd'
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },
        {
          test: /\.js$/,
          loader: 'babel-loader'
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    plugins: [new VueLoaderPlugin()],
    resolve: {
      extensions: ['.vue']
    }
  },
  { clone: false }
);

if (options.isProduction) {
  config.plugins = config.plugins.concat([
    new webpack.LoaderOptionsPlugin({
      minimize: true
    }),

    // Set the production environment
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),

    // Minify with dead-code elimination
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ]);
}
module.exports = config;
