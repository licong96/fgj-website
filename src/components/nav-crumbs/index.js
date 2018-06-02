import './index.scss';
import _fgj from 'util/fgj.js'

var templateIndex = require('./index.hbs');

// 导航屑
/**
 * @class NavCrumbs
 * @param { Object } option
 * {
 *    box: 容器,
 *    list: 列表,
 *    hideCode: Boolean 是否隐藏二维码
 * }
 */
export default class NavCrumbs {
  constructor() {
    this.defaultOption = {
      list: []
    };
  }

  renderList(option) {
    var option = this.option = $.extend({}, this.defaultOption, option);

    // 判断容器必须是一个合法的query元素
    if (!(this.option.box instanceof jQuery)) {
      return
    };

    var html = _fgj.handlebars(templateIndex, {
      list: option.list,
      hideCode: option.hideCode   // 是否隐藏二维码
    });
    option.box.html(html)
  }
};