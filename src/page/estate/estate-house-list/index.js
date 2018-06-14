import 'common/js/common.js';
import 'components/header-nav/index.scss';
import 'components/footer/index.js'
import './index.scss';

import _fgj from 'util/fgj.js';
import Tag from 'components/tag/index.js';
import SubNav from 'components/sub-nav/index.js';
import HeaderNav from 'components/header-nav/index.js';
import NavCrumbs from 'components/nav-crumbs/index.js';
import HouseList from 'components/house-list/index.js';
import Paging from 'components/paging/index.js';

import { GetPageListRoomType } from 'api/estate/estate-room-type.js';

var tempEmpty = require('components/empty/empty.hbs');
var tempEstateInfo = require('../estate-detail/estate-info.hbs');

// 户型列表
var houseList = {
  el: {
  },
  data: {
    estateID: _fgj.getUrlParam('EstateID') || (window.location.href = '/estate/estate-list.html'),
    estateData: null,
  },
  init() {
    this.onLoad();
  },
  onLoad() {
    this.initHeaderNav();  // 给当前导航加class

    this.rederSubNav();         // 渲染二级导航
    this.renderHouseList();     // 渲染户型列表
    this.renderPaging();        // 渲染分页
  },
  // 初始化头部导航
  initHeaderNav() {
    var nav = new HeaderNav();
    nav.init({
      current: $('.js_header_nav .nav-a').eq(1)    // 当前导航元素
    });
  },
  // 初始化导航屑
 initNavCrumbs() {
   let estateData = this.data.estateData;
   let listData = [
     {
       name: '楼盘',
       link: './estate-list.html'
     },
     {
       name: estateData._estatename
     }
   ];
   let html = new NavCrumbs();
   html.renderList({
     box: $('.js_nav_crumbs'),
     list: listData
   });
 },
  // 渲染楼盘基本信息
  rendEstateInfo() {
    var data = this.data.estateData;
    data.tag = data._tag ? data._tag.split('|') : '';    // 处理tag
    var html = _fgj.handlebars(tempEstateInfo, data);
    $('.js_estate_info').html(html);
  },
  // 渲染二级导航
  rederSubNav() {
    var estateID = this.data.estateID;
    var subNav = new SubNav({
      box: $('.js_sub_nav'),
      list: [
        {
          name: '楼盘详情',
          href: './estate-detail.html?EstateID=' + estateID
        }, {
          name: '楼盘相册',
          href: './estate-photo.html?EstateID=' + estateID
        },  {
          name: '在售房源',
          href: './estate-housing.html?EstateID=' + estateID
        },{
          name: '户型列表',
          href: './estate-house-list.html?EstateID=' + estateID,
          active: true
        }, 
      ]
    });
    subNav.renderList();
  },
  // 渲染户型列表
  renderHouseList() {
    GetPageListRoomType({
      EstateID: this.data.estateID,
      page: 1,
    },
    res => {
      let data = res.data;
      this.filter(data);
      // console.log(data)
      var houseList = new HouseList({
        box: $('.js_house_wrap'),
        list: data,
      });
      houseList.renderList();

      this.data.estateData = data[0]._estate;   // 保存楼盘数据
      this.rendEstateInfo();    // 渲染楼盘基本信息
      this.initNavCrumbs();     // 初始化导航屑
    },
    err => {
      $('.js_house_wrap').html(tempEmpty);
    });
  },
  // 过滤数据
  filter(data) {
    data.map(list => {
      // 这里要和楼盘详细里的样板房数据统一
      list._type = {
        _typename: list._typename,
        _countf: list._countf,
        _countt: list._countt,
        _countw: list._countw,
        _county: list._county,
        _buildsquare: list._buildsquare,
        _realsquare: list._realsquare,
        _giftsquare: list._giftsquare,
        _getrate: list._getrate,
      };
      if (list._tag) {
        list.tag = list._tag.split('|');
      };
    })
  },
  // 渲染分页
  renderPaging() {
    var page = new Paging({
      box: $('.js_paging'),
      list: []
    });
    page.renderList();
  }
};

$(function () {
  houseList.init()
});