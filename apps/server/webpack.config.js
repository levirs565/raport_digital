const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { join } = require('path');

// throw new Error(require.resolve('@nx/webpack/app-plugin'))
module.exports = {
  output: {
    path: join(__dirname, 'dist'),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: './tsconfig.app.json',
        mode: "write-dts"
      }
    })
  ],
};
