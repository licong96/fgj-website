import './index.scss';
import _fgj from 'util/fgj.js'

let templateIndex = require('./index.hbs');
let templateListMsg = require('./list-msg.hbs');  // 资讯用到的评论列表

// 评论
/**
 * @class Comment
 * @param { Element } box 容器
 */
export default class Comment {
  constructor() {
    this.defaultOption = {
    };
  }

  init(options) {
    this.option = $.extend({}, this.defaultOption, options);

    this.renderCon();   // 渲染主体内容
  }

  // 渲染主体内容
  renderCon() {
    let html = _fgj.handlebars(templateIndex, {});
    this.option.box.html(html);
  }

  // 渲染评论列表-资讯
  renderListMsg (param) {
    let html = _fgj.handlebars(templateListMsg, {
      list: param.data
    });
    param.box.html(html);
  }
};