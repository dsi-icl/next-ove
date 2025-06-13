const path = require('path');

/**
 * @param {import('webpack').Configuration} baseConfig
 * @returns {import('webpack').Configuration}
 */
module.exports = (baseConfig) => {
  return {
    ...baseConfig,
    // ensure we're targeting electron's main process
    target: 'electron-main',

    // resolve: { extensions: ['.ts', '.tsx', '.cjs'] },
    output: {
      // name of your output file
      // filename: 'main.cjs',
      path: path.resolve(__dirname, "..", "..", "dist", "apps", "ove-client"),
      // [name] will be "main", "preload", etc.
      // give them a .cjs extension
      filename: '[name].cjs',
      chunkFilename: '[name].cjs',

      // webpack 5 syntax for cjs output
      library: {
        type: 'commonjs2',
      }
    },

    // make sure we don’t accidentally emit an esm module
    experiments: {
      outputModule: false,
    }
  };
};