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

import { GetModel } from 'api/estate/estate-room-type.js';
import { GetListMore } from 'api/estate/estate-photo.js';

var tempEstateInfo = require('../estate-detail/estate-info.hbs');
var tempBaseInfo = require('./base-info.hbs');
var tempDesign = require('./design.hbs');
var tempEmpty = require('components/empty/empty.hbs');

// 户型列表
var houseList = {
  data: {
    TypeID: _fgj.getUrlParam('TypeID') || (window.location.href = '/estate/estate-list.html'),
    estateID: _fgj.getUrlParam('EstateID') || (window.location.href = '/estate/estate-list.html'),
    estateData: null,
  },
  init() {
    this.onLoad();
    this.bindEvent();
  },
  onLoad() {
    this.GetModel();    // 获取户型详细数据
    this.GetListMorePhoto();  // 获取设计风格图片
  },
  bindEvent() {
    this.initHeaderNav(); // 初始化头部导航
    this.rederSubNav();   // 渲染二级导航
  },
  // 初始化头部导航
  initHeaderNav() {
    var nav = new HeaderNav();
    nav.init({
      current: $('.js_header_nav .nav-a').eq(1)    // 当前导航元素
    });
  },
  // 获取户型详细数据
  GetModel() {
    GetModel({
      TypeID: this.data.TypeID
    },
    res => {
      console.log(res)
      this.data.estateData = res.data;
      var html = _fgj.handlebars(tempBaseInfo, res.data);
      $('.js_base_info').html(html);

      this.initNavCrumbs();   // 初始化导航屑
      this.rendEstateInfo();  // 渲染楼盘基本信息
    },
    err => {
      $('.js_base_info').html(tempEmpty);
    })
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
        name: estateData._estate._estatename
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
    var data = this.data.estateData._estate;
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
          href: './estate-house-list.html?EstateID=' + estateID
        }, 
      ]
    });
    subNav.renderList();
  },
  // 获取设计风格图片
  GetListMorePhoto() {
    GetListMore({
      num: 5,
      PhotoType: '样板间',
      EstateID: this.data.estateID
    },
    res => {
      let data = res.data;
      let html = _fgj.handlebars(tempDesign, {
        left: data[0],
        right: data.splice(1)
      });
      $('.js_design').html(html);
    },
    err => {

    });
  }
};

$(function () {
  houseList.init()
});