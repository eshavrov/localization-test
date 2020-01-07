const path = require("path");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");

const NODE_ENV = process.env.NODE_ENV || "development";

// Source maps are resource heavy and can cause out of memory issue for large source files.
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== "false";

const ANALYTICS_ENABLE = process.env.ANALYTICS_ENABLE === "True";

const isEnvDevelopment = NODE_ENV === "development";

const isEnvProduction = NODE_ENV === "production";

module.exports = {
  mode: "development",
  entry: "./home",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "build.js"
  },

  watch: isEnvDevelopment,
  watchOptions: {
    aggregateTimeout: 100,
    poll: 1000
  },

  devtool: isEnvProduction
    ? shouldUseSourceMap && "hidden-source-map"
    : isEnvDevelopment && "source-map",

  plugins: [
    new webpack.DefinePlugin({
      isEnvDevelopment: JSON.stringify(isEnvDevelopment),
      NODE_ENV: JSON.stringify(NODE_ENV),
      "process.env.NODE_ENV": JSON.stringify(NODE_ENV),
      "process.env.ANALYTICS_ENABLE": JSON.stringify(ANALYTICS_ENABLE)
    })
  ],

  resolve: {
    modules: ["node_modules"],
    extensions: [".js", ".jsx", ".json"]
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: ["@babel/plugin-transform-runtime"]
          }
        }
      }
    ]
  },

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        test: /\.jsx?$/i,
        parallel: true,
        sourceMap: shouldUseSourceMap,
        extractComments: false,
        terserOptions: {
          parse: {
            // We want terser to parse ecma 8 code. However, we don't want it
            // to apply any minification steps that turns valid ecma 5 code
            // into invalid ecma 5 code. This is why the 'compress' and 'output'
            // sections only apply transformations that are ecma 5 safe
            // https://github.com/facebook/create-react-app/pull/4234
            ecma: 8
          },
          compress: {
            ecma: 5,
            warnings: false,
            // Disabled because of an issue with Uglify breaking seemingly valid code:
            // https://github.com/facebook/create-react-app/issues/2376
            // Pending further investigation:
            // https://github.com/mishoo/UglifyJS2/issues/2011
            comparisons: false,
            // Disabled because of an issue with Terser breaking valid code:
            // https://github.com/facebook/create-react-app/issues/5250
            // Pending further investigation:
            // https://github.com/terser-js/terser/issues/120
            inline: 2
          },
          mangle: {
            safari10: true
          },
          output: {
            comments: /@license/i,

            ecma: 5,
            comments: false,
            // Turned on because emoji and regex is not minified properly using default
            // https://github.com/facebook/create-react-app/issues/2488
            ascii_only: true
          }
        }
      })
    ]
  }
};
