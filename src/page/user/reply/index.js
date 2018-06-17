import 'common/js/common.js';
import './index.scss';

import _fgj from 'util/fgj.js';
import HeaderNav from 'components/header-nav/index.js';
import UserNav from 'components/user-nav/index.js';
import BeList from 'components/be-list/index.js';
import Paging from 'components/paging/index.js';
import _common from '../common.js';  // 用户中心公用js

// 回复及评论
let reply = {
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
    this.renderList();    // 渲染列表
    this.renderPaging();  // 渲染未读分页
  },
  bindEvent() {
  },
  // 渲染用户侧边栏导航
  renderUserNav() {
    let nav = new UserNav({
      name: 'reply'
    });
  },
  // 渲染列表
  renderList() {
    let list = new BeList({
      box: $('.js_box'),
      list: [
        {

        }, {

        }, {

        }, {

        }
      ]
    })
  },
  // 渲染分页
  renderPaging() {
    let params = {
      page: 1
    }
    let pag = new Paging();

    pag.init({
      box: $('.js_paging'),
      pagecount: 20,   // 总页数
      page: 18,    // 当前页数
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
  reply.init();
  $('body').bootstrapMaterialDesign();
});