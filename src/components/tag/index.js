import './index.scss';
import _fgj from 'util/fgj.js'

var templateIndex = require('./index.hbs');

// 标签
/**
 * @class Tag
 * @param { Object } option box: 容器， tag: 标签
 */
export default class Tag {
  constructor(option) {
    this.option = option;
  }

  renderTag() {
    var option = this.option
    var html = _fgj.handlebars(templateIndex, {
      tag: option.tag
    });
    $(option.box).html(html)
  }
};