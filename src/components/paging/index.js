import './index.scss';
import _fgj from 'util/fgj.js'

let templateIndex = require('./index.hbs');

// 分页
/**
 * @class Paging
 * @param { Element } box 容器
 * @param { Number } pagecount 总页数
 * @param { Number } page 当前页数
 * @param { Number } num 一页多少条
 * @param { Number } previous 上一页
 * @param { Number } next 下一页
 * @param { Function } onSuccess 回调函数
 */
export default class Paging {
  constructor() {
    // 默认参数
    this.defaultOption = {
      box: null,
      previous: 0,
      next: 0,
      page: 1,
      num: 20,
      onSuccess: null,    // 回调函数
    };
  }

  init(options) {
    let option = this.option = $.extend({}, this.defaultOption, options);

    this.renderPage();  // 渲染分页

   
    this.bindEvent();  // 绑定方法
  }

  // 渲染分页
  renderPage() {
    let option  = this.option,
        page    = parseInt(option.page),
        pagecount = parseInt(option.pagecount),
        isOne   = {},
        pageArr = [];
    
    // 上一页
    pageArr.push({
      text: '上一页',
      value: option.previous,
      disabled: option.page > 1 ? '' : ' disabled'   // 这里是有空格的，可别去掉了
    });

    // 中间数字
    for (let i = 1, length = pagecount; i <= length; i++) {
      // 左边隐藏
      if (pagecount > 5 && i > 1 && i < page - 2 ) {
        if (!isOne.left) {
          isOne.left = true;
          pageArr.push({
            text: '...',
            active: 'disabled'
          });
        }
        continue
      };
      // 右边隐藏
      if (pagecount > 5 && i > page + 2 && i < pagecount) {
        if (!isOne.right) {
          isOne.right = true;
          pageArr.push({
            text: '...',
            active: 'disabled'
          });
        }
        continue        
      };
      pageArr.push({
        text: i,
        value: i,
        active: i == page? 'active disabled' : '',    // 这里用了两个等于号，不检查数据类型
      });
    };

    // 下一页
    pageArr.push({
      text: '下一页',
      value: option.next,
      disabled: pagecount > page ? '' : 'disabled'
    });

    let html = _fgj.handlebars(templateIndex, {
      list: pageArr,
      page: page,
      pageCount: pagecount
    });
    $(option.box).html(html);
  }

  // 绑定方法
  bindEvent() {
    let option = this.option,
        $this = null;

    option.box.find('.page-item').on('click', function () {
      $this = $(this);
      if ($this.hasClass('disabled')) {
        return
      };
      option.onSuccess($(this).data('value'));
    });
  }
};