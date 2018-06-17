import './index.scss';
import _fgj from 'util/fgj.js'

let templateIndex = require('./index.hbs');

/**
 * 头部弹出提示
 * @class HintTop
 * 对外暴露方法，插入type和text
 */
export default class HintTop {
  constructor() {
    this.defaultOption = {
      type: 'success',
      text: '提示文字',
      className: parseInt(Math.random() * 1000)
    }
  }

  // 渲染
  render(data) {
    let option = this.option = $.extend({}, this.defaultOption, data);

    let html = _fgj.handlebars(templateIndex, option);
    $('body').append(html);

    this.getElement();
  }

  // 获取元素
  getElement() {
    let $hint = $('.js_hint_top_' + this.option.className);

    this.el = {
      $hint: $hint,
      $alert: $hint.find('.alerts')
    };
  }

  // 隐藏
  hide() {
    this.el.$hint.removeClass('show')
  }

  // 快捷方法，成功状态
  success(text) {
    this.fnShow('success', text)
  }
  error(text) {
    this.fnShow('error', text)
  }
  info(text) {
    this.fnShow('info', text)
  }
  warning(text) {
    this.fnShow('warning', text)
  }

  fnShow(type, text) {
    // 每次都创建一个提示
    this.render({
      type,
      text,
      className: parseInt(Math.random() * 1000)
    });
    
    let $hint = this.el.$hint;
    $hint.addClass('show');
    setTimeout(() => {
      $hint.remove();    // 完了之后删除后
    }, 3000);
  }

};