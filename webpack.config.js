const { join } = require('path');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const { mode = 'production', browser } = argv;
  const __DEV__ = mode === 'development';

  const manifestPath = join(__dirname, browser);
  const buildPath = join(__dirname, 'build', browser);
  const sourcePath = join(__dirname, 'src');

  return {
    mode,

    devtool: __DEV__ ? 'eval-cheap-source-map' : false,

    entry: {
      'content-script': join(sourcePath, 'content-script.js'),
      background: join(sourcePath, 'background.js'),
      options: join(sourcePath, 'options'),
    },

    output: {
      filename: '[name].js',
      path: buildPath,
    },

    plugins: [
      new CleanWebpackPlugin({
        // to prevent unchanged files from removal
        cleanStaleWebpackAssets: false,
      }),
      new CopyPlugin([
        { from: join(manifestPath) },
        { from: join(sourcePath, 'options.html') },
        { from: join(sourcePath, 'icons'), to: 'icons' },
      ]),
    ],
  };
};
