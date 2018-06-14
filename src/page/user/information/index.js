import 'common/js/common.js';
import './index.scss';

import _fgj from 'util/fgj.js'; 
import HeaderNav from 'components/header-nav/index.js';
import UserNav from 'components/user-nav/index';

// 个人资料
let information = {
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
  },
  bindEvent() {
  },
  // 渲染用户侧边栏导航
  renderUserNav() {
    let nav = new UserNav({
      name: 'information'
    });
  }
};

$(function () {
  information.init();
  $('body').bootstrapMaterialDesign();
});