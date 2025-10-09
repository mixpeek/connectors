const path = require('path')

module.exports = {
  entry: './src/modules/mixpeekContextAdapter.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'mixpeekContextAdapter.js',
    library: 'MixpeekContextAdapter',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  },
  devtool: 'source-map'
}

