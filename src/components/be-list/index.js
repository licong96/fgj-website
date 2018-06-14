import './index.scss';
import _fgj from 'util/fgj.js'; 

let tempIndex = require('./index.hbs');

// 头像和文字左右排版的列表，用到的地方有：我的消息
/**
 * @class BeList
 * @param {Array} list 列表数据
 * @param {Element} box 父容器
 */
export default class BeList {
  constructor(option) {
    // 默认参数
    let defaultOption = {
    };

    this.option = $.extend({}, defaultOption, option);

    this.init();
  }

  init() {
    this.render();
    this.bindEvent();
  }

  render() {
    let option = this.option;
    
    let html = _fgj.handlebars(tempIndex, {
      list: option.list
    });
    
    option.box.html(html);
  }

  bindEvent() {
  }
};