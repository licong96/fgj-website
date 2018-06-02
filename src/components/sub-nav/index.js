import './index.scss';
import _fgj from 'util/fgj.js'

var templateIndex = require('./index.hbs');

// 二级导航
/**
 * @class subNav
 * @param { Object } option
 * {
 *    box: 容器,
 *    list: 列表
 * }
 */
export default class subNav {
  constructor(option) {
    this.option = option;
  }

  renderList() {
    var option = this.option
    var html = _fgj.handlebars(templateIndex, {
      list: option.list
    });
    $(option.box).html(html)
  }
};