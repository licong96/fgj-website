const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

// 生成环境

module.exports = {
  entry: {
    'index'               : './src/page/index/index.js',
    'estate-list'         : './src/page/estate/estate-list/index.js',
    'estate-detail'       : './src/page/estate/estate-detail/index.js',
    'estate-photo'        : './src/page/estate/estate-photo/index.js',
    'estate-housing'      : './src/page/estate/estate-housing/index.js',
    'estate-house-list'   : './src/page/estate/estate-house-list/index.js',
    'estate-house-detail' : './src/page/estate/estate-house-detail/index.js',
    'message-home'        : './src/page/message/message-home/index.js',
    'message-list'        : './src/page/message/message-list/index.js',
    'message-detail'      : './src/page/message/message-detail/index.js',
    'fitment-home'        : './src/page/fitment/fitment-home/index.js',
    'fitment-list'        : './src/page/fitment/fitment-list/index.js',
    'fitment-detail'      : './src/page/fitment/fitment-detail/index.js',
    'about'               : './src/page/footer/about/index.js',
    'second-hand-list'    : './src/page/second-hand/list/index.js',
    'second-hand-detail'  : './src/page/second-hand/detail/index.js',
    'second-hand-publish' : './src/page/second-hand/publish/index.js',
    'user-information'    : './src/page/user/information/index.js',
    'user-message'        : './src/page/user/message/index.js',
    'user-reply'          : './src/page/user/reply/index.js',
    'user-collect'        : './src/page/user/collect/index.js',
    'user-manage'         : './src/page/user/manage/index.js',
    'user-manage-house'   : './src/page/user/manage-house/index.js',
  },
  output: {
    filename: 'js/[name].js',
    publicPath: '/',       // 模板、样式、脚本、图片等资源对应的server上的路径
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.string$/,
        exclude: /node_modules/,
        loader: 'html-loader?attrs=img:src img:data-src'
      },
      {
        test: /\.hbs$/,
        exclude: /node_modules/,
        loader: 'html-loader?attrs=img:src img:data-src'
      },
      {
        test: /\.js$/,
        exclude: path.resolve(__dirname, 'node_modules'),  // 排除这个文件夹
        include: path.resolve(__dirname, 'src'),   // 指定这个文件夹
        loader: 'babel-loader'
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                minimize: true
              }
            }, {
              loader: 'postcss-loader'
            }, {
              loader: 'sass-loader'
            }
          ]
        })
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                minimize: true
              }
            }
          ]
        })
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: 'image/[name].[hash:5].[ext]'
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'font/[name].[ext]'
            }
          }
        ]
      }
    ]
  },
  node: {
    fs: 'empty'     // 避免错误信息
  },
  // 配置路径
  resolve: {
    alias: {
      handlebars: 'handlebars/dist/handlebars.min.js',      // handlebars警告
      node_modules: __dirname + '/node_modules',
      common: __dirname + '/src/common',
      components: __dirname + '/src/components',
      util: __dirname + '/src/util',
      page: __dirname + '/src/page',
      api: __dirname + '/src/api',
      data: __dirname + '/src/data',
    }
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'common',
      minChunks: 3
    }),
    new UglifyJsPlugin({
      sourceMap: true
    }),
    new ExtractTextPlugin('css/[name].css'),
    new HtmlWebpackPlugin(HtmlPlugin('首页', 'index', 'index')),
    new HtmlWebpackPlugin(HtmlPlugin('楼盘列表', 'estate/estate-list', 'estate-list')),
    new HtmlWebpackPlugin(HtmlPlugin('楼盘详细', 'estate/estate-detail', 'estate-detail')),
    new HtmlWebpackPlugin(HtmlPlugin('楼盘图片详细', 'estate/estate-photo', 'estate-photo')),
    new HtmlWebpackPlugin(HtmlPlugin('楼盘房源列表', 'estate/estate-housing', 'estate-housing')),
    new HtmlWebpackPlugin(HtmlPlugin('楼盘户型列表', 'estate/estate-house-list', 'estate-house-list')),
    new HtmlWebpackPlugin(HtmlPlugin('楼盘户型详细', 'estate/estate-house-detail', 'estate-house-detail')),
    new HtmlWebpackPlugin(HtmlPlugin('资讯首页', 'message/message-home', 'message-home')),
    new HtmlWebpackPlugin(HtmlPlugin('资讯列表', 'message/message-list', 'message-list')),
    new HtmlWebpackPlugin(HtmlPlugin('资讯详细', 'message/message-detail', 'message-detail')),
    new HtmlWebpackPlugin(HtmlPlugin('装修首页', 'fitment/fitment-home', 'fitment-home')),
    new HtmlWebpackPlugin(HtmlPlugin('装修列表', 'fitment/fitment-list', 'fitment-list')),
    new HtmlWebpackPlugin(HtmlPlugin('装修详细', 'fitment/fitment-detail', 'fitment-detail')),
    new HtmlWebpackPlugin(HtmlPlugin('关于我们', 'footer/about', 'about')),
    new HtmlWebpackPlugin(HtmlPlugin('二手房列表', 'second-hand/list', 'second-hand-list')),
    new HtmlWebpackPlugin(HtmlPlugin('二手房详细', 'second-hand/detail', 'second-hand-detail')),
    new HtmlWebpackPlugin(HtmlPlugin('二手房发布', 'second-hand/publish', 'second-hand-publish')),
    new HtmlWebpackPlugin(HtmlPlugin('个人资料', 'user/information', 'user-information')),
    new HtmlWebpackPlugin(HtmlPlugin('我的消息', 'user/message', 'user-message')),
    new HtmlWebpackPlugin(HtmlPlugin('回复及评论', 'user/reply', 'user-reply')),
    new HtmlWebpackPlugin(HtmlPlugin('我的收藏', 'user/collect', 'user-collect')),
    new HtmlWebpackPlugin(HtmlPlugin('我的房源', 'user/manage', 'user-manage')),
    new HtmlWebpackPlugin(HtmlPlugin('编辑房源', 'user/manage-house', 'user-manage-house')),
  ],
  devtool: 'cheap-module-source-map',
};

/**
 * html模板配置
 * @param {String} name 名称
 * @param {string} chunk 依赖
 * @returns {Object}
 */
function HtmlPlugin(title, name, chunk) {
  return {
    title: title,
    filename: name + '.html',
    template: './src/view/' + name + '.html',
    chunks: ['common', chunk],
    favicon: './src/common/image/favicon.ico',
    hash: true,
    cache: true,
    minify: {
      collapseWhitespace: true,
      conservativeCollapse: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeRedundantAttributes: true,
      // preserveLineBreaks: true,
      // minifyCSS: true,
    }
  }
}