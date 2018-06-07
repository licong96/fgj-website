import './index.scss';
import _fgj from 'util/fgj.js'

let templateIndex = require('./index.hbs');

/**
 * 浮动在中间的加载中
 * @class HintTop
 * 对外暴露show方法，插入type和text
 */
export default class HintTop {
  constructor() {
    this.option = {
      type: 'primary',
      text: '提示信息'
    };
    this.render();
    this.el = {
      $hint: $('.js_hint_top '),
      $alert: $('.js_hint_top .alert')
    }
  }

  // 绑定事件
  bindEvent() {
  }

  // 渲染
  render() {
    let html = _fgj.handlebars(templateIndex, {
      type: this.option.type,
      text: this.option.text
    });
    $('body').append(html);
  }

  // 显示
  show(options) {
    this.option = $.extend({}, this.option, options);

    this.el.$hint.addClass('show')
    this.el.$alert[0].className = 'alert alert-' + options.type
    this.el.$alert.html(options.text);

    setTimeout(() => {
      this.hide();
    }, 3000);
  }
  // 隐藏
  hide() {
    this.el.$hint.removeClass('show')
  }

};