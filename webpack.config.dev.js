import path from 'path';
import webpack from 'webpack';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import dotenv from 'dotenv';
import HappyPack from 'happypack';
// import SpeedMeasurePlugin from 'speed-measure-webpack-plugin';
// smp.wrap() export default out
// import HardSourceWebpackPlugin from 'hard-source-webpack-plugin';

// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// new BundleAnalyzerPlugin()

// const smp = new SpeedMeasurePlugin();

// call dotenv and it will return an Object with a parsed key
const env = dotenv.config().parsed;

// reduce it to a nice object, the same as before
const envKeys = Object.keys(env).reduce((prev, next) => {
  const newPrev = prev;
  newPrev[`process.env.${next}`] = JSON.stringify(env[next]);
  return newPrev;
}, {});


export default {
  devtool: 'cheap-module-eval-source-map',
  mode: 'none',
  stats: 'errors-only',
  entry: [
    '@babel/polyfill',
    'webpack-hot-middleware/client?reload=true',
    path.resolve(__dirname, 'app/index'),
  ],
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'app'),
    publicPath: '/',
    filename: 'bundle.js',
  },
  optimization: {
    minimizer: [new UglifyJsPlugin({
      cache: true,
      parallel: true,
    })],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin(envKeys),
    new CopyWebpackPlugin([
      { from: './favicon.ico' },
    ]),
    new webpack.DllReferencePlugin({
      context: path.join(__dirname, 'dist'),
      manifest: require('./dist/vendor-manifest.json'),
    }),
    new HappyPack({
      id: 'js',
      loaders: ['cache-loader', 'babel-loader?cacheDirectory'],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'happypack/loader?id=js',
      }, {
        test: /\.css$/,
        loader: 'style-loader',
      }, {
        test: /\.css$/,
        loader: 'css-loader',
        query: {
          modules: true,
          localIdentName: '[name]__[local]___[hash:base64:5]&camelCase',
        },
      }, {
        test: /\.(png|jpg|gif|mp3)$/i,
        loaders: [{
          loader: 'url-loader',
          options: {
            limit: 8192,
          },
        }],
      }, {
        test: /\.svg$/,
        loaders: ['@svgr/webpack', 'url-loader'],
      },
    ],
  },
};
