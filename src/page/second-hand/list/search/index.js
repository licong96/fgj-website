import './index.scss';
import _fgj from 'util/fgj.js'; 
let tempIndex = require('./index.hbs');

/**
 * 搜索
 * @class Search
 * @param { Element } box 容器
 * @param { Function } confirm 回调函数
 */
export default class Search {
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
    let option = this.option,
        $input = option.box.find('.js_search_val'),
        time   = null,
        val    = '';

    option.box.find('.js_search_btn').on('click', function () {
      val = $.trim($input.val());
      typeof option.confirm === 'function' && option.confirm(val);
    });
    $input.on('input propertychange', function () {
      val = $.trim($input.val())
      if (time) {
        clearTimeout(time)
      }
      time = setTimeout(() => {
        typeof option.confirm === 'function' && option.confirm(val);
      }, 500);
    });

    // 回车搜索
    $input.keydown(function(e) {
      val = $.trim($input.val())
      if (e.keyCode === 13) {
        typeof option.confirm === 'function' && option.confirm(val);
      }
    });
  }

  // 渲染结构
  render() {
    let option = this.option,
    html = _fgj.handlebars(tempIndex, {});
    return html
  }

};