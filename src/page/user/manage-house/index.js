import 'common/js/common.js';
import './index.scss';

import _fgj from 'util/fgj.js';
import UserNav from 'components/user-nav/index.js';
import _common from '../common.js';  // 用户中心公用js

import { GetModelDetail } from 'api/user/manage-house.js';

// 房源管理
let manage = {
  el: {
  },
  data: {
    PropertyID: _fgj.getUrlParam('PropertyID') || (window.location.href = './manage.html')
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
      successGetInfo(data) {
        console.log(data)
      },
      errorGetInfo(err) {
      }
    });
  },
  onLoad() {
    this.renderUserNav();   // 渲染用户侧边栏导航
  },
  bindEvent() {
    // $('.btn').on('click', function (e) {
    //   e.preventDefault();
    // })
  },
  // 获取详细页数据
  GetModelDetail() {
    GetModelDetail({
      PropertyID: this.data.PropertyID
    }, 
    res => {
      console.log(res)
    }, 
    err => {

    })
  },
  // 渲染用户侧边栏导航
  renderUserNav() {
    let nav = new UserNav({
      name: 'manage'
    });
  },
};

$(function () {
  manage.init();
  $('body').bootstrapMaterialDesign();
});