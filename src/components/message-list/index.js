import './index.scss';
import _fgj from 'util/fgj.js'

var templateIndex = require('./index.hbs');

// 资讯列表
/**
 * @class MessageList
 * @param { Object } option 
 * {
 *  box: 容器,
 *  list: 列表数据
 * }
 */
export default class MessageList {
  constructor() {
    this.defaultOption = {
      box: null,
      list: []
    };
  }

  renderList(options) {
    var option = this.option = $.extend({}, this.defaultOption, options);

    // 判断容器必须是一个合法的query元素
    if (!(this.option.box instanceof jQuery)) {
      return
    };

    var html = _fgj.handlebars(templateIndex, {
      list: option.list
    });
    option.box.html(html);
  }
};