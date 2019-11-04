
'use strict';
/* global __dirname module require*/
/* eslint comma-dangle: ["error", "never"] */
const {webpackConfig}             = require('./src/app.config.js');
const webpack                     = require('./tools/node_modules/webpack');
const path                        = require('./tools/node_modules/path');
const CleanWebpackPlugin          = require('./tools/node_modules/clean-webpack-plugin');
const {GenerateSW}                = require('./tools/node_modules/workbox-webpack-plugin');
const BrowserSyncPlugin           = require('./tools/node_modules/browser-sync-webpack-plugin');
const HistoryApiFallback          = require('./tools/node_modules/connect-history-api-fallback');
const CopyWebpackPlugin           = require('./tools/node_modules/copy-webpack-plugin');
const HtmlWebpackPlugin           = require('./tools/node_modules/html-webpack-plugin');
const TerserPlugin                = require('./tools/node_modules/terser-webpack-plugin');
const ImageminPlugin              = require('./tools/node_modules/imagemin-webpack-plugin').default;
const WebpackPwaManifest          = require('./tools/node_modules/webpack-pwa-manifest');
const FaviconsWebpackPlugin       = require('./tools/node_modules/favicons-webpack-plugin');
const ProgressBarPlugin           = require('./tools/node_modules/progress-bar-webpack-plugin');
const BundleAnalyzerPlugin        = require('./tools/node_modules/webpack-bundle-analyzer').BundleAnalyzerPlugin;
const htmlWebpackMultiBuildPlugin = require('./tools/node_modules/html-webpack-multi-build-plugin');
const multiPlugin                 = new htmlWebpackMultiBuildPlugin(); // must be a single instance to work

// app specific
const {
  name,
  short_name,
  description,
  display,
  theme_color,
  background_color,
  cacheId 
} = webpackConfig;

// babel-loader helper
// must run some node_nodules that are written in es6+ through babel
const babelLoaderExcludeNodeModulesExcept = exceptionList => {
  if (Array.isArray(exceptionList) && exceptionList.length) {
    return new RegExp(`node_modules[\\/|\\\\](?!(${exceptionList.join('|')})).*`, 'i');
  }
  return /node_modules/i;
};
// shared between both configs
const mode    = 'production';

const resolve = {
  modules:          [path.resolve(__dirname, 'src'), 'node_modules'],
  descriptionFiles: ['package.json']
};

const resolveLoader = {
  // An array of directory names to be resolved to the current directory
  modules: ['./tools/node_modules']
};

const optimization = {
  // This option enables smart code splitting. 
  // With it, webpack would extract the vendor code 
  // if it gets larger than 30 kB (before minification and gzip). 
  // It would also extract the common code – 
  // this is useful if your build produces several bundles 
  // (e.g. if you split your app into routes).
  splitChunks: {
    chunks: 'all',
  },
  runtimeChunk: true,
  minimizer: [
    new TerserPlugin({
      parallel: true,
      terserOptions: {
        output: {
          comments: false
        }
      }
    })      
  ]
};

const htmlLoader = {
  test: /\.(html)$/,
  use: { 
    loader: 'html-loader',
    options: {
      exportAsEs6Default: true,
      minimize:           true,
      minifyCSS:          true,
      removeComments:     true,
      collapseWhitespace: true
    }
  }
};

const workerLoader = {
  test: /worker\.js$/,
  use: {loader: 'worker-loader'}
};

const cssLoader = {
  test: /\.css$/,
  use: [
    'style-loader',
    'css-loader'
  ]       
};

const fileLoader = {
  test: /\.(woff|woff2|eot|ttf)$/, // specifically for 'typeface-' self hosted font-family node_modules
  use: { 
    loader: 'file-loader' 
  }
};

const responsiveLoader = {
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
};

const htmlPlugin = new HtmlWebpackPlugin({
  // chunksSortMode: 'none', // topofsort.js error workaround 4/9/18      
  template: './src/index.ejs', 
  minify: {
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
    removeComments: true,
    useShortDoctype: true
  },
  inject: false
});


// mulit-config mode, 
// one for legacy browsers (especially googlebot) and 
// one for modern browsers that we officially support
module.exports = [{
  name: 'legacy',
  mode,
  entry: [
    // will be picked up by webpack and
    // broken up into smaller files that contain 
    // only the required polyfills as per babel-preset-env browserlist
    'babel-polyfill',
    '@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js',
    // MUST be webcomponents-bundle.js, webcomponents-loader.js does not work for googlebot
    '@webcomponents/webcomponentsjs/webcomponents-bundle.js',
    '@webcomponents/shadycss/entrypoints/custom-style-interface.js',
    './src/index.js'
  ],
  output: {
    // must contain 'legacy' for html-webpack-multi-build-plugin
    filename:      '[name].[chunkhash].legacy.js', 
    chunkFilename: '[name].[chunkhash].legacy.js',
    path:           path.resolve(__dirname, 'dist')
  },
  resolve,
  resolveLoader,
  optimization,
  module: {
    rules: [
      htmlLoader, 
      workerLoader,
      cssLoader,
      fileLoader,
      responsiveLoader,
      // use this config to support googlebot
      {
        test:    /\.js$/,
        exclude: babelLoaderExcludeNodeModulesExcept([
          'comlinkjs',
          '@polymer',
          '@longlost',
          '@webcomponents'
        ]),
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['./tools/node_modules/@babel/preset-env'],
            plugins: [
              './tools/node_modules/@babel/plugin-syntax-dynamic-import',
              './tools/node_modules/@babel/plugin-transform-runtime',              
              './tools/node_modules/@babel/plugin-proposal-object-rest-spread'
            ]
          }
        }
      }
    ]
  },
  plugins: [  
    new ProgressBarPlugin(),
    // new BundleAnalyzerPlugin(),
    // so vendor hashes dont change when project code changes
    new webpack.HashedModuleIdsPlugin(),
    // pass a stubbed version of service worker file to dev server
    new CopyWebpackPlugin([{
      from: './src/images', 
      to:   'images'
    }, {
      from: './src/robots.txt', 
      to:   'robots.txt'
    }, {
      from: './src/sitemap.xml', 
      to:   'sitemap.xml'
    }, {
      from: './src/service-worker-app.js', 
      to:   'service-worker-app.js'
    }]),
    htmlPlugin,
    multiPlugin, // must be single instance
    new FaviconsWebpackPlugin({
      appName:      name,
      appShortName: short_name,
      // Your source logo
      logo: path.resolve('src/images/manifest/icon.png'),
      // The prefix for all image files (might be a folder or a name)
      prefix: 'icons-[hash]/',
      // Emit all stats of the generated icons
      emitStats: false,
      // // The name of the json containing all favicon information
      // statsFilename: 'iconstats-[hash].json',
      // // Generate a cache file with control hashes and
      // // don't rebuild the favicons until those hashes change
      // persistentCache: true,
      // Inject the html into the html-webpack-plugin
      inject: true,
      // favicon background color (see https://github.com/haydenbleasel/favicons#usage)
      background: background_color,
      theme_color,
      appleStatusBarStyle: 'black-translucent', //  'black-translucent', 'black' or 'default'
      // favicon app title (see https://github.com/haydenbleasel/favicons#usage)
      title: name,   
      // which icons should be generated (see https://github.com/haydenbleasel/favicons#usage)
      icons: {
        android:      true,
        appleIcon:    true,
        appleStartup: true,
        coast:        false,
        favicons:     true,
        firefox:      true,
        opengraph:    false,
        twitter:      false,
        yandex:       false,
        windows:      false
      }
    }),
    new WebpackPwaManifest({
      inject:       true,
      fingerprints: true,
      ios:          true,
      crossorigin:  null, //can be null, use-credentials or anonymous
      name,
      short_name,
      description,
      start_url:    '/',
      display,
      theme_color,
      background_color,
      icons: [{
        src:   path.resolve('src/images/manifest/icon.png'),
        sizes: [96, 128, 192, 256, 384, 512] // multiple sizes
      }]
    }),
    new ImageminPlugin({test: /\.(jpe?g|png|gif|svg)$/i}),
    new BrowserSyncPlugin({
      host: 'localhost',
      port: 8080,
      server: {
        baseDir:    './dist', 
        middleware: [HistoryApiFallback()]
      }
    })
  ]
}, {
  name: 'modern',
  mode,
  entry: [
    // will be picked up by webpack and
    // broken up into smaller files that contain 
    // only the required polyfills as per babel-preset-env browserlist
    'babel-polyfill',
    '@webcomponents/webcomponentsjs/webcomponents-loader.js',    
    '@webcomponents/shadycss/entrypoints/custom-style-interface.js',
    './src/index.js'
  ],
  output: {
    filename:      '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].js',
    path:           path.resolve(__dirname, 'dist')
  },
  resolve,
  resolveLoader,
  optimization,
  module: {
    rules: [
      htmlLoader, 
      workerLoader,
      cssLoader,
      fileLoader,
      responsiveLoader,
      // use this config to support modern browsers
      {
        test:    /\.js$/,
        exclude: babelLoaderExcludeNodeModulesExcept([
          '@longlost',
          '@polymer'
        ]),
        use: {
          loader: 'babel-loader',
          options: {
            presets: [[
              './tools/node_modules/@babel/preset-env',
              {
                targets: {
                  browsers: [
                    '>1%',
                    'not ie 11',
                    'not op_mini all'
                  ]
                }
              }
            ]],
            plugins: [
              './tools/node_modules/@babel/plugin-syntax-dynamic-import',
              './tools/node_modules/@babel/plugin-transform-runtime',
              './tools/node_modules/@babel/plugin-proposal-object-rest-spread',
              ['./tools/node_modules/babel-plugin-template-html-minifier', {
                modules: {
                  '@polymer/lit-element/lit-element.js':    ['html'],
                  '@polymer/polymer/polymer-element.js':    ['html'],
                  '@polymer/polymer/polymer-legacy.js':     ['html'],
                  '@polymer/polymer/lib/utils/html-tag.js': ['html'],               
                  '@longlost/app-element.js':               ['html']
                },
                htmlMinifier: {
                  collapseWhitespace: true,
                  minifyCSS:          true,
                  removeComments:     true
                }
              }]
            ]
          }
        }
      }
    ]
  },
  plugins: [  
    // new BundleAnalyzerPlugin(),
    // so vendor hashes dont change when project code changes
    new webpack.HashedModuleIdsPlugin(),
    htmlPlugin,
    multiPlugin, // must be single instance, must be after htmlPlugin
    // create a service worker
    new GenerateSW({
      cacheId,
      clientsClaim:              true,
      importScripts:             ['service-worker-app.js'],
      skipWaiting:               false,
      navigateFallback:          './index.html',
      navigateFallbackWhitelist: [/^(?!\/__)/], // allow firebase api to bypass sw
      runtimeCaching: [{
        urlPattern: new RegExp('^https://storage\\.googleapis\\.com/'),
        handler:   'staleWhileRevalidate',
        options: {
          // Use a custom cache name.
          cacheName: 'app-images',
          // Only cache 50 images.
          expiration: {
            maxEntries: 50,
          }
        }
      }]
    }),   
    // cleanup dist folder and service worker files before each build
    new CleanWebpackPlugin(['dist'])
  ]
}];
