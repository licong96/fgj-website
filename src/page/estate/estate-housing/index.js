import 'common/js/common.js';
import 'components/header-nav/index.scss';
import 'components/footer/index.js'
import './index.scss';

import _fgj from 'util/fgj.js';
import Tag from 'components/tag/index.js';
import SubNav from 'components/sub-nav/index.js';
import HeaderNav from 'components/header-nav/index.js';
import NavCrumbs from 'components/nav-crumbs/index.js';
import HousingList from 'components/housing-list/index.js';
import Paging from 'components/paging/index.js';

import { GetPageListRoom } from 'api/estate/estate-room.js';

var tempEstateInfo = require('../estate-detail/estate-info.hbs');
var tempEmpty = require('components/empty/empty.hbs');

// 在售房源
var housingList = {
  data: {
    estateID: _fgj.getUrlParam('EstateID') || (window.location.href = '/estate/estate-list.html'),  // 当前楼盘ID
    estateData: null,
    params: {
      page: 1,
    }
  },
  init() {
    this.onLoad();
    this.bindEvent();
  },
  onLoad() {
    this.initHeaderNav();  // 给当前导航加class

    this.rederHousingList();    // 渲染房源
    this.renderPaging();        // 渲染分页
    this.createChart('chartHousing');   // 创建图表
  },
  bindEvent() {
    this.rederSubNav();      // 渲染二级导航
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
        }, {
          name: '在售房源',
          href: './estate-housing.html?EstateID=' + estateID,
          active: true
        }, {
          name: '户型列表',
          href: './estate-house-list.html?EstateID=' + estateID
        }, 
      ]
    });
    subNav.renderList();
  },
  // 渲染房源
  rederHousingList() {
    GetPageListRoom({
      page: 1,
      EstateID: this.data.estateID
    },
    res => {
      let data = res.data;
      this.filter(data);
      console.log(data)
      var housing = new HousingList({
        box: $('.js_list_wrap'),
        list: res.data
      });
      housing.renderList();

      // 保存楼盘基本信息
      this.data.estateData = data[0]._estate;
      this.rendEstateInfo();
      this.initNavCrumbs();
    },
    err => {
      $('.js_list_wrap').html(tempEmpty);
    });
  },
  // 过滤数据
  filter(data, url) {
    data.map(list => {
      switch(list._status) {
        case 0:
          list.Status = '在售';
        break;
        case 1:
          list.Status = '预定';
        break;
        case 2:
          list.Status = '已售';
        break;
        default:
          list.Status = '没有这种情况';
        break;
      }
    });
  },
  // 渲染分页
  renderPaging() {
    var page = new Paging({
      box: $('.js_paging'),
      list: []
    });
    page.renderList();
  },
  // 创建图表
  createChart(el) {
    var ctx = document.getElementById(el).getContext('2d');
    var myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ["1", "2", "3", "4", "5", "6", '7'],
        datasets: [{
          label: '公寓',
          data: [10, 30, 50, 20, 25, 44, 10],
          backgroundColor: 'transparent',
          borderColor: 'rgba(255,99,132,1)',
          borderWidth: 2
        }, {
          label: '商住',
          data: [100, 33, 22, 19, 11, 49, 30],
          backgroundColor: 'transparent',
          borderColor: '#ff9800',
          borderWidth: 2
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        },
        animation: {
          duration: 1000
        },
        title: {
          display: false,
          // text: '标题'
        }
      }
    });
  },
};

$(function () {
  housingList.init()
});