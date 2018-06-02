import 'common/js/commonStyle.js';
import './index.scss';

import MoveTo from 'moveto';
import _fgj from 'util/fgj.js'; 
import HeaderNav from 'components/header-nav/index.js';
import LoaderTimer from 'components/loader-timer/index.js';
import Paging from 'components/paging/index.js';
import _search from './search/index.js'
import _screen from './screen/index.js'
import _list from './item/index.js'

let tempEmpty = require('components/empty/empty.hbs');

// 二手房列表
let list = {
  el: {
    moveTo    : new MoveTo(),
    trigger   : document.getElementById('estateListScreen'),
  },
  data: {
    uri: new URI(window.location.href),    // 当前url地址
    params: {   // 筛选参数
      page: 1,
    },
  },
  init() {
    this.onLoad();
    this.bindEvent();
  },
  onLoad() {
    this.getListData();   // 获取列表数据
  },
  bindEvent() {
    this.initHeaderNav();   // 导航
    this.initSearch();    // 搜索  
    this.initScreen();    // 筛选
  },
  // 获取列表数据
  getListData() { 
    let list = new _list({
      box: $('.js_list'),
      data: [
        {},{},{},
        {},{},{},
        {},{},{},
      ]
    });
  },
  // 解析url，去搜索
  parseURI() {
    this.data.params = $.extend({}, this.data.params, this.data.uri.query(true));   // 获取页面参数
    console.log(this.data.params)
    // this.initPitch();    // 选中的筛选条件
  },
  // 修改url地址参数
  setUrlParams() {
    let uri = this.data.uri,
        params = this.data.params,
        path = new URI(uri.pathname());

    console.log(params);
    path.query(params);
    history.pushState(null, document.title, path.toString());   // 修改url地址参数
  },
  // 初始化头部导航
  initHeaderNav() {
    var nav = new HeaderNav();
    nav.init({
      current: $('.js_header_nav .nav-a').eq(2)    // 当前导航元素
    })
  },
  // 初始化搜索
  initSearch() {
    let search = new _search({
      box: $('.js_search'),
      confirm: function (val) {
        console.log(val)
      }
    });
  },
  // 初始化筛选
  initScreen() {
    let screen = new _screen({
      box: $('.js_screen')
    });
  }
};

$(function () {
  list.init()
});