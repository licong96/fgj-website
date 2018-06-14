import 'common/js/common.js';
import './index.scss';

import _fgj from 'util/fgj.js';
import HeaderNav from 'components/header-nav/index.js';
import UserNav from 'components/user-nav/index.js';
import Paging from 'components/paging/index.js';

let tempList = require('./list.hbs');

// 我的收藏
let collect = {
  el: {
  },
  data: {
  },
  init() {
    this.onLoad();
    this.bindEvent();
  },
  onLoad() {
    this.renderUserNav();   // 渲染用户侧边栏导航

    this.forRender();   // 循环渲染，只为演示
    this.renderPaging(4);  // 渲染分页
  },
  bindEvent() {
  },
  // 渲染用户侧边栏导航
  renderUserNav() {
    let nav = new UserNav({
      name: 'collect'
    });
  },
  // 循环渲染
  forRender() {
    for (let i = 0; i < 3; i++) {
      this.renderList(i+1);  // 渲染列表
      this.renderPaging(i+1);  // 渲染分页
    };
  },
  // 渲染列表
  renderList(index) {
    let html = _fgj.handlebars(tempList, {
      list: [
        {}, {}, {}, {}
      ]
    });
    $('.js_tab_' + index).html(html);
  },
  // 渲染分页
  renderPaging(index) {
    let params = {
      page: 1
    }
    let unreadPaging = new Paging();

    unreadPaging.init({
      box: $('.js_paging_' + index),
      pagecount: 13,   // 总页数
      page: 6,    // 当前页数
      previous: parseInt(params.page) - 1,  // 上一页的值
      next: parseInt(params.page) + 1, // 下一页的值
      num: 20,
      onSuccess: function (page) {
        params.page = page;
        // _this.GetPageList();  // 获取数据
      }
    });
  }
};

$(function () {
  collect.init();
  $('body').bootstrapMaterialDesign();
});