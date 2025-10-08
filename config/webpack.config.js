const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: {
      popup: './extension/popup/popup.tsx',
      background: './extension/background/service-worker.ts',
      'content-google-maps': './extension/content/google-maps.ts'
    },
    output: {
      path: path.resolve(__dirname, '../dist'),
      filename: '[name].js',
      clean: true
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    require('tailwindcss'),
                    require('autoprefixer')
                  ]
                }
              }
            }
          ]
        }
      ]
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
        '@': path.resolve(__dirname, '../extension')
      }
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './extension/popup/index.html',
        filename: 'popup.html',
        chunks: ['popup']
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'extension/manifest.json', to: 'manifest.json' },
          { from: 'extension/assets', to: 'assets', noErrorOnMissing: true },
          { from: 'extension/public', to: '.', noErrorOnMissing: true }
        ]
      })
    ],
    devtool: isProduction ? false : 'inline-source-map',
    optimization: {
      minimize: isProduction
    }
  };
};
