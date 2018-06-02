import './index.scss';
import _fgj from 'util/fgj.js';

var templateIndex = require('./index.hbs');

// 加载中
/**
 * @class LoaderTimer
 * @param { Object } option 
 * {
*    @param { Element } box 容器
*    @param { Object } loaderStyle 加载中样式,
*    @param { Object } shaderStyle 遮罩样式,
*    @param { Boolean } noScroll 是否禁止页面滚动
 * }
 */
export default class LoaderTimer {
  constructor() {
    // 默认参数
    this.defaultOption = {
      loaderStyle: {
        position: 'absolute',
        top: '0'
      },
      shaderStyle: {
        backgroundColor: 'rgba(255, 255, 255, .8)',
        top: '0'
      },
      noScroll: false,
    };
  }

  // 渲染加载中
  render(options) {
    let option = this.option = $.extend({}, this.defaultOption, options);

    // 判断容器必须是一个合法的jquery元素
    if (!(option.box instanceof jQuery)) {
      return
    };

    var html = _fgj.handlebars(templateIndex, {
      text: option.text,
      loaderStyle: option.loaderStyle,
      shaderStyle: option.shaderStyle
    });

    if (!option.show) {
      this.hide();    // 默认隐藏掉
    }
    option.box.html(html);

    // this.noScroll();    // 是否禁止页面滚动
  }

  // 是否禁止页面滚动
  noScroll() {
    var option = this.option;
    if (option.noScroll) {
      $('html').css('overflow', 'hidden');
    }
  }

  // 显示加载中
  show() {
    var option = this.option;
    option.box.show();

    if (option.noScroll) {
      $('html').css('overflow', 'hidden');
    }
  }

  // 隐藏加载中
  hide() {
    var option = this.option;
    option.box.hide();

    if (option.noScroll) {
      $('html').css('overflow', 'visible');
    }
  }
};