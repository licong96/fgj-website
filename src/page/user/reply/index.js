import 'common/js/common.js';
import './index.scss';

import _fgj from 'util/fgj.js';
import HeaderNav from 'components/header-nav/index.js';
import UserNav from 'components/user-nav/index.js';
import BeList from 'components/be-list/index.js';
import Paging from 'components/paging/index.js';
import _common from '../common.js';  // 用户中心公用js

import { GetMyPageList } from 'api/user/reply.js';

let tempEmpty = require('components/empty/empty.hbs');

// 回复及评论
let reply = {
  el: {
  },
  data: {
    listData: [],   // 数据
    params_1: {
      todo: 'Property_Comment',
      page: 1
    },
    params_2: {
      todo: 'News_Comment',
      page: 1
    },
    isDesign: false
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
    this.GetMyPageList(1);   // 获取二手房评论数据
    this.GetMyPageList(2);   // 获取资讯评论
  },
  bindEvent() {
  },
  // 获取二手房评论数据
  GetMyPageList(index) {
    let params = this.data['params_' + index];

    GetMyPageList({
      todo: params.todo,
      page: params.page,
    }, 
    res => {
      console.log(res)
      this.renderList(index, res);    // 渲染列表
      this.renderPaging(index, res);  // 渲染未读分页

      // 这只是一个点击效果，不必纠结
      if (!this.data.isDesign) {
        this.data.isDesign = true;
        setTimeout(() => {
          $('body').bootstrapMaterialDesign();
        }, 300);
      }
    }, 
    err => {
      $('#box').html(tempEmpty);
    })
  },
  // 渲染用户侧边栏导航
  renderUserNav() {
    let nav = new UserNav({
      name: 'reply'
    });
  },
  // 渲染列表
  renderList(index, res) {
    let data = res.data;

    data.forEach(item => {
      if (item._propertyid) {
        item.link = '../second-hand/detail.html?PropertyID=' + item._propertyid;
      }
      else if (item._newsid) {
        item.link = `../message/message-detail.html?NewsID=${item._newsid}&NewsClassID=${item._newsclassid}`;
      };
    });

    let list = new BeList({
      box: $('.js_tab_' + index),
      list: res.data
    });
  },
  // 渲染分页
  renderPaging(index, res) {
    let params  = this.data['params_' + index],
        _this   = this;

    this.pag1 ? '' : this.pag1 = new Paging();

    this.pag1.init({
      box: $('.js_paging_' + index),
      pagecount: res.pagecount,   // 总页数
      page: params.page,    // 当前页数
      previous: parseInt(params.page) - 1,  // 上一页的值
      next: parseInt(params.page) + 1, // 下一页的值
      num: 20,
      onSuccess: function (page) {
        params.page = page;
        _this.GetMyPageList(index);  // 获取数据
      }
    });
  }
};

$(function () {
  reply.init();
});