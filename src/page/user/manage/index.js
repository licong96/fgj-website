import 'common/js/common.js';
import './index.scss';

import _fgj from 'util/fgj.js';
import HeaderNav from 'components/header-nav/index.js';
import UserNav from 'components/user-nav/index.js';
import Paging from 'components/paging/index.js';

let tempList = require('./list.hbs');

// 房源管理
let manage = {
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
    this.renderList();    // 渲染列表
    this.renderPaging();  // 渲染未读分页
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
  // 渲染列表
  renderList() {
    let html = _fgj.handlebars(tempList, {
      list: [
        {}, {}, {}, {}
      ]
    });
    $('.js_box').html(html);
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
  manage.init();
  $('body').bootstrapMaterialDesign();
});