import './index.scss';
import _fgj from 'util/fgj.js'

var templateIndex = require('./index.hbs');

// 楼盘列表
/**
 * @class EstateList
 * @param { Object } option 
 * {
 *  box: 容器,
 *  list: 列表数据
 * }
 */
export default class EstateList {
  constructor(option) {
    this.option = option;
  }

  renderList() {
    var option = this.option
    var html = _fgj.handlebars(templateIndex, {
      list: option.list
    });
    $(option.box).html(html);
  }
};