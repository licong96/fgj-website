import 'common/js/common.js';
import './index.scss';

import _fgj from 'util/fgj.js';
import HeaderNav from 'components/header-nav/index.js';
import UserNav from 'components/user-nav/index.js';
import BeList from 'components/be-list/index.js';
import Paging from 'components/paging/index.js';
import _common from '../common.js';  // 用户中心公用js

// 我的消息
let message = {
  el: {
  },
  data: {
  },
  init() {
    this.initCommon();
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
    this.renderUnread();    // 渲染未读列表
    this.renderRead();    // 渲染已读列表

    this.renderUnreadPaging();  // 渲染未读分页
    this.renderReadPaging();  // 渲染已读分页
  },
  bindEvent() {
  },
  // 渲染用户侧边栏导航
  renderUserNav() {
    let nav = new UserNav({
      name: 'message'
    });
  },
  // 渲染未读列表
  renderUnread() {
    let unread = new BeList({
      box: $('.js_unread_box'),
      list: [
        {

        }, {

        }, {

        }, {

        }
      ]
    })
  },
  // 渲染已读列表
  renderRead() {
    let unread = new BeList({
      box: $('.js_read_box'),
      list: [
        {},
        {},
        {},
      ]
    })
  },
  // 渲染未读分页
  renderUnreadPaging() {
    let params = {
      page: 1
    }
    let unreadPaging = new Paging();

    unreadPaging.init({
      box: $('.js_unread_paging'),
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
  },
  // 渲染已读分页
  renderReadPaging() {
    let params = {
      page: 1
    }
    let unreadPaging = new Paging();

    unreadPaging.init({
      box: $('.js_read_paging'),
      pagecount: 1,   // 总页数
      page: 1,    // 当前页数
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
  message.init();
  $('body').bootstrapMaterialDesign();
});