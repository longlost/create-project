
'use strict';
/* global __dirname module require*/
/* eslint comma-dangle: ["error", "never"] */
const path               = require('./tools/node_modules/path');
const CleanWebpackPlugin = require('./tools/node_modules/clean-webpack-plugin');
const CopyWebpackPlugin  = require('./tools/node_modules/copy-webpack-plugin');
const BrowserSyncPlugin  = require('./tools/node_modules/browser-sync-webpack-plugin');
const HtmlWebpackPlugin  = require('./tools/node_modules/html-webpack-plugin');
const ProgressBarPlugin  = require('./tools/node_modules/progress-bar-webpack-plugin');
const DashboardPlugin    = require('./tools/node_modules/webpack-dashboard/plugin');


module.exports = {
  mode: 'development',
  entry: [    
    './tools/node_modules/@webcomponents/shadycss/entrypoints/custom-style-interface.js',
    './src/index.js'
  ],
  output: {
    filename: '[name].bundle.js',
    path:     path.resolve(__dirname, 'dist')
  },
  resolve: {
    modules:          [path.resolve(__dirname, 'src'), 'node_modules'],
    descriptionFiles: ['package.json']
  },
  devtool: 'cheap-module-source-map',
  resolveLoader: {
    // An array of directory names to be resolved to the current directory
    modules: ['./tools/node_modules'],
  },
  module: {
    rules: [
      {
        test: /\.(html)$/,
        use: { 
          loader: 'html-loader',
          options: {
            exportAsEs6Default: true
          }
        }
      },
      {
        test: /worker\.js$/,
        use: { 
          loader: 'worker-loader'
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]       
      },
      {
        test: /\.(woff|woff2|eot|ttf)$/, // specifically for 'typeface-' self hosted font-family node_modules
        use: { 
          loader: 'file-loader' 
        }
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        use: {
          loader: 'responsive-loader',
          options: {
            sizes:           [300, 600, 900, 1200, 1500],
            placeholder:     true,
            placeholderSize: 50,
            name:            'imgs/[name]-[width].[ext]'
          }
        }
      }
    ]
  },
  // Enable the Webpack dev server which will build, serve, and reload our
  // project on changes.
  devServer: {
    host:               '0.0.0.0', 
    port:               3100,
    contentBase:        './dist',
    compress:           true,
    historyApiFallback: true
  },
  plugins: [
    // cleanup dist folder before each build
    new CleanWebpackPlugin(['dist']),
    // pass a stubbed version of service worker file to dev server
    new CopyWebpackPlugin([{
      from: './src/service-worker.js', 
      to:   'service-worker.js'
    }, {
      from: './src/images', 
      to:   'images'
    },{
      from: './src/robots.txt', 
      to:   'robots.txt'
    }, {
      from: './src/sitemap.xml', 
      to:   'sitemap.xml'
    }]),
    new HtmlWebpackPlugin({
      chunksSortMode: 'none', // topofsort.js error workaround 4/9/18
      // Load a custom template
      template: './src/index.ejs'
    }),
    // BrowserSync options 
    new BrowserSyncPlugin({
      // browse to http://localhost:3000/ during development 
      host: 'localhost',
      port: 3000,
      // proxy the Webpack Dev Server endpoint 
      // (which should be serving on http://localhost:3100/) 
      // through BrowserSync 
      proxy: 'http://localhost:3100/'
    }, {
      // plugin options 
      // prevent BrowserSync from reloading the page 
      // and let Webpack Dev Server take care of this 
      reload: false
    }),
    new ProgressBarPlugin(),
    new DashboardPlugin()
  ]
};
