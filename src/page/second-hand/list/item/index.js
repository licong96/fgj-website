import './index.scss';
import _fgj from 'util/fgj.js'; 
let tempIndex = require('./index.hbs');

/**
 * 二手房买卖和二手房租赁列表
 * @class List
 * @param { Element } box 容器
 */
export default class List {
  constructor(param) {
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
    html = _fgj.handlebars(tempIndex, {
      list: option.data
    });
    return html
  }

};