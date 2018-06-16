import 'common/js/common.js';
import './index.scss';

import _fgj from 'util/fgj.js'; 
import HeaderNav from 'components/header-nav/index.js';
import UserNav from 'components/user-nav/index';

import { UpUserInfo, GetMyInfo, } from 'api/user/information.js';

import _common from '../common.js';  // 用户中心公用js
import _upPassword from './up-password/index.js';
import _upMyInfo from './up-my-info/index.js';

let tempEmpty = require('components/empty/empty.hbs');

// 个人资料
let information = {
  el: {
  },
  data: {
  },
  init() {
    this.initCommon();  // 初始化公共信息

    this.onLoad();
    this.bindEvent();
  },
  // 初始化公共信息
  initCommon() {
    let _this = this;

    _common.init({
      successGetInfo(data) {    // 登陆成功后返回用户信息
        _upMyInfo.init(data);   // 修改用户信息
        _upPassword.init(data);    // 修改密码
      },
      errorGetInfo(err) {
        $('.js_up_user_info').html(tempEmpty);
      }
    });
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
  },
};

$(function () {
  information.init();
  $('body').bootstrapMaterialDesign();
});