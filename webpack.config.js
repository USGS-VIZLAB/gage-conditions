const webpack = require("webpack");

module.exports = {
    entry: './src/app.js',
    output: {
        filename: './bundle.js'
    },
    plugins: [
      new webpack.ProvidePlugin({
          d3: 'd3'
      })
    ]
};
