import 'common/js/commonStyle.js';
import './index.scss';

import MoveTo from 'moveto';
import _fgj from 'util/fgj.js'; 
import HeaderNav from 'components/header-nav/index.js';
import LoaderTimer from 'components/loader-timer/index.js';
import Paging from 'components/paging/index.js';
import _search from './search/index.js'
import Screen from './screen/index.js'
import _list from './item/index.js'

import { GetPageList } from 'api/second-hand/list.js';
import { GetDistrict, GetDictionary } from 'api/public.js';

let tempEmpty = require('components/empty/empty.hbs');

// 二手房列表
let list = {
  el: {
    moveTo    : new MoveTo(),
    trigger   : document.getElementById('estateListScreen'),
  },
  data: {
    uri: new URI(window.location.href),    // 当前url地址
    params: {   // 列表
      page: 1,
    },
  },
  init() {
    this.onLoad();
    this.bindEvent();
  },
  onLoad() {
    this.initScreen();    // 初始化筛选
    this.GetPageList();   // 获取列表数据
    this.GetDistrict();   // 获取区域数据
    // this.getMetroData();   // 获取地铁数据
    this.renderPaging();  // 根据数据渲染分页
  },
  bindEvent() {
    this.initHeaderNav();   // 导航
    this.initSearch();    // 搜索  
  },
  // 获取列表数据
  GetPageList() {
    GetPageList(this.data.params,
    res => {
      console.log(res)
    }, 
    err => {

    });

    let list = new _list({
      box: $('.js_list'),
      data: [
        {},{},{},
        {},{},{},
        {},{},{},
      ]
    });
  },
  // 获取区域数据
  GetDistrict() {
    GetDistrict({
      num: 99,
      CityID: 218
    }, 
    res => {
      this.Screen.screenFunction(res.data, 'DistrictName', '_districtname');
    }, 
    err => {
      $('.DistrictName').html('暂时无信息')
    })
  },
  // 获取地铁数据
  getMetroData() {
    GetDictionary({
      num: 99,
      DictionaryNo: 'SubwayStation'
    }, 
    res => {
      this.Screen.screenFunction(res.data, 'SubwayStation', '_dictionaryvalue');
    }, 
    err => {
      $('.SubwayStation').html('暂时无信息')
    })
  },
  // 初始化筛选功能
  initScreen() {
    let _this = this;
    this.Screen ? '' : this.Screen = new Screen();

    this.Screen.init({
      box: $('.js_screen'),
      params: this.data.params,
      callParams(params) {    // 修改参数后的回调
        console.log(params)
        _this.data.params = params;
        _this.GetPageList()     // 重新获取数据
        _this.setUrlParams()    // 修改url地址参数
      }
    });

    // 初始化地铁找房
    this.Screen.onGetSubwayStation(() => {
      this.getMetroData();    // 获取地铁数据
    });
    // 总价
    this.Screen.screenAddMethods('PriceRang');
    // 居室 | 几房
    this.Screen.screenAddMethods('CountF');
    // 面积
    this.Screen.screenAddMethods('SquareRang');
  },
  // 根据数据渲染分页
  renderPaging() {
    this.Paging ? '' : this.Paging = new Paging();

    this.Paging.init({
      box: $('.js_paging'),
      pagecount: 10,   // 总页数
      page: 1,    // 当前页数
      previous: parseInt(1) - 1,  // 上一页的值
      next: parseInt(1) + 1, // 下一页的值
      num: 20,
      onSuccess: function (page) {
        console.log(page)
      }
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
};

$(function () {
  list.init()
});