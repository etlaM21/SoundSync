const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isDev = argv.mode === "development";
  console.log("Webpack mode:", argv.mode); 
  
  return {
    mode: isDev ? "development" : "production",
    entry: {
      'client-bundle': './src/index.js'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
    },
    devServer: {
      static: {
        directory: path.resolve(__dirname, 'dist'),
      },
      hot: true,
      compress: true,
      port: 9000,
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
            },
          },
        },
        {
          test: /\.(s(a|c)ss)$/,
          use: ['style-loader', 'css-loader', 'sass-loader']
        },
        {
          test: /\.svg$/,
          use: [
            {
              loader: '@svgr/webpack'
            },
          ],
        }
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    devtool: 'inline-source-map',
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'src/CSXS/manifest.xml', to: 'CSXS/manifest.xml' },
          { from: 'src/host/index.jsx', to: 'host/' },
          { from: 'src/CSInterface.js', to: '' }
        ],
      }),
      new webpack.DefinePlugin({
        __IS_DEV__: JSON.stringify(isDev)
      })
    ]
  }
};
