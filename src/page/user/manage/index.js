import 'common/js/common.js';
import './index.scss';

import _fgj from 'util/fgj.js';
import HeaderNav from 'components/header-nav/index.js';
import UserNav from 'components/user-nav/index.js';
import Paging from 'components/paging/index.js';
import _common from '../common.js';  // 用户中心公用js

import { GetPageList } from 'api/user/manage.js';

let tempList = require('./list.hbs');
let tempEmpty = require('components/empty/empty.hbs');

// 房源管理
let manage = {
  el: {
    listBox: $('#listBox')
  },
  data: {
    page: 1,
    listData: [],   // 数据列表
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
    this.GetPageList();   // 获取列表数据
  },
  bindEvent() {
    // $('.btn').on('click', function (e) {
    //   e.preventDefault();
    // })
  },
  // 渲染用户侧边栏导航
  renderUserNav() {
    let nav = new UserNav({
      name: 'manage'
    });
  },
  // 获取列表数据
  GetPageList() {
    GetPageList({
      page: this.data.page
    }, 
    res => {
      console.log(res.data)
      this.data.listData = res.data;
      this.renderList();    // 渲染列表
      this.renderPaging(res);  // 渲染未读分页
    }, 
    err => {
      this.el.listBox.html(tempEmpty);
    })
  },
  // 渲染列表
  renderList() {
    let data = this.data.listData;
    let html = _fgj.handlebars(tempList, {
      list: data
    });
    this.el.listBox.html(html);
  },
  // 渲染分页
  renderPaging(res) {
    let _this = this,
        page  = this.data.page,
        Pagings = new Paging();

    Pagings.init({
      box: $('.js_paging'),
      pagecount: res.pagecount,   // 总页数
      page: page,    // 当前页数
      previous: parseInt(page) - 1,  // 上一页的值
      next: parseInt(page) + 1, // 下一页的值
      num: 20,
      onSuccess: function (page) {
        _this.data.page = page;
        _this.GetPageList();  // 获取数据
      }
    });
  }
};

$(function () {
  manage.init();
  $('body').bootstrapMaterialDesign();
});