import './index.scss';
import _fgj from 'util/fgj.js'; 

let tempIndex1 = require('./index-1.hbs');   // 二手房买卖
// let tempIndex2 = require('./index-2.hbs');   // 二手房租赁

/**
 * 筛选
 * @class _screen
 * @param { Element } box 容器
 */
export default class _screen {
  constructor(param) {
    // 默认参数
    this.option = $.extend({}, param);
    this.init();
  }

  // 初始化
  init() {
    this.option.box.html(this.render());

    this.bindEvent();   // 绑定事件
  }

  // 绑定事件
  bindEvent() {
    let option = this.option
  }

  // 渲染结构
  render() {
    let option = this.option,
    html = _fgj.handlebars(tempIndex1, {});
    return html
  }

};