import 'common/js/common.js';
import 'components/header-nav/index.scss';
import 'components/footer/index.js'
import './index.scss';

import _fgj from 'util/fgj.js';
import NavCrumbs from 'components/nav-crumbs/index.js';

// 装修列表
var fitmentList = {
  data: {
  },
  init() {
    this.onLoad();
    this.bindEvent();
  },
  onLoad() {
    this.activeHeader();    // 给当前导航加class
    this.renderNavCrumbs();   // 渲染导航屑
  },
  bindEvent() {
  },
  // 给当前导航加class
  activeHeader() {
    $('.nav .nav-a').eq(4).addClass('active');
  },
  // 渲染导航屑
  renderNavCrumbs() {
    var listData = [
      {
        name: '装修',
        link: './fitment-home.html'
      },
      {
        name: '装修列表'
      }
    ];
    var html = new NavCrumbs();
    html.renderList({
      box: $('.js_nav_crumbs'),
      list: listData
    });
  },
};

$(function () {
  fitmentList.init()
});