import './index.scss';
import _fgj from 'util/fgj.js'

let templateIndex = require('./index.hbs');

/**
 * 登陆
 * @class Login
 * @param { Element } box 容器
 */
export default class Login {
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
};