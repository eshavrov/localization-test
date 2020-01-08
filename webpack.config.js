const path = require("path");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const { getCacheGroups } = require("./config/utils");

const NODE_ENV = process.env.NODE_ENV || "development";

// Source maps are resource heavy and can cause out of memory issue for large source files.
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== "false";

const ANALYTICS_ENABLE = process.env.ANALYTICS_ENABLE === "True";

const isDev = NODE_ENV === "development";
const isProduction = NODE_ENV === "production";

module.exports = {
  mode: "development",

  context: path.resolve(__dirname, "src"),

  entry: {
    page0: "./page-0",
    page1: "./page-1"
  },

  output: {
    path: path.resolve(__dirname, "public/dist"),
    filename: "[name].bundle.js",
    chunkFilename: isProduction
      ? "static/js/[name].[contenthash:8].bundle.js"
      : isDev && "static/js/[name].bundle.js"
  },

  watch: isDev,
  watchOptions: {
    aggregateTimeout: 100,
    poll: 1000
  },

  devtool: isProduction
    ? shouldUseSourceMap && "hidden-source-map"
    : isDev && "source-map",

  plugins: [
    new webpack.DefinePlugin({
      isDev: JSON.stringify(isDev),
      NODE_ENV: JSON.stringify(NODE_ENV),
      "process.env.NODE_ENV": JSON.stringify(NODE_ENV),
      "process.env.ANALYTICS_ENABLE": JSON.stringify(ANALYTICS_ENABLE)
    }),

    new HtmlWebpackPlugin({
      title: "Entry 0",
      filename: path.resolve(__dirname, "public/0.html"),
      template: path.resolve(__dirname, "templates/base.html"),
      chunks: "page0"
    }),
    new HtmlWebpackPlugin({
      title: "Entry 1",
      filename: path.resolve(__dirname, "public/1.html"),
      template: path.resolve(__dirname, "templates/base.html"),
      chunks: "page1"
    })
  ],

  resolve: {
    modules: ["node_modules"],
    extensions: [".js", ".jsx"]
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
    splitChunks: {
      chunks: "all",
      minSize: 100,
      maxSize: 0,
      minChunks: 1,
      automaticNameDelimiter: "~",
      automaticNameMaxLength: 30,
      cacheGroups: {
        // react: {
        //   test: /[\\/]node_modules[\\/]((react).*)/,
        //   name: "react",
        //   chunks: "all"
        // },
        // lodash: {
        //   test: /[\\/]node_modules[\\/]((lodash).*)/,
        //   name: "lodash",
        //   chunks: "all"
        // },
        // slate: {
        //   test: /[\\/]node_modules[\\/]((slate).*)/,
        //   name: "slate",
        //   chunks: "all"
        // },
        // commons: {
        //   test: /[\\/]node_modules[\\/]((?!(react|slate|lodash)).*)/,
        //   name: "common",
        //   chunks: "all"
        // },
        ...getCacheGroups([["react"], ["slate"], ["lodash"]])
      }
    },

    minimize: isProduction,
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
