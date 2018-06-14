import 'common/js/common.js';
import 'components/footer/index.js'
import './index.scss';

import MenuSpy from 'menuspy';
import anchorScroll from 'util/anchor-scroll.js';
import stickybits from 'stickybits';
import _fgj from 'util/fgj.js';
import HeaderNav from 'components/header-nav/index.js';
import NavCrumbs from 'components/nav-crumbs/index.js';
import HouseList from 'components/house-list/index.js';
import MessageList from 'components/message-list/index.js';

import { GetModel } from 'api/estate/estate-detail.js';
import { GetListMore, GetRecordCount } from 'api/estate/estate-photo.js';
import { GetListMoreRoom } from 'api/estate/estate-room.js';
import { GetListMoreRoomSample } from 'api/estate/estate-room-sample.js';

var tempEstateInfo = require('./estate-info.hbs');
var tempEstatePhoto = require('./estate-photo.hbs');
var tempBroker = require('./broker.hbs');
var tempBasicInfo = require('./basic-info.hbs');
var tempReportList = require('./report-list.hbs');
var tempSaleHouseList = require('./sale-house-list.hbs');
var tempEmpty = require('components/empty/empty.hbs');

// 房贷计算器
import { calculatorData } from 'util/calculator/index.js'


// 楼盘详细
var estateDetail = {
  data: {
    estateID: _fgj.getUrlParam('EstateID') || (window.location.href = '/estate/estate-list.html'),  // 当前楼盘ID
    estateData: {},   // 楼盘数据
    estateList: JSON.parse(sessionStorage.getItem('estateList')),   // 楼盘列表
    photoData: {},    // 楼盘图片数据
  },
  init() {
    this.onLoad();
    this.bindEvent();
  },
  onLoad() {
    this.initHeaderNav();  // 给当前导航加class

    this.GetModel();  // 获取楼盘详细数据
    this.GetListMoreRoom(); // 渲染在售房源
    this.GetListMoreRoomSample(); // 渲染样板房列表

    // this.getEstate();
    // this.renderBroker();  // 渲染经纪人
    // this.getTargetStat(); // 获取数据分析
    // this.renderReport();    // 渲染价值报告分析

    // this.createChart('statChart');     // 创建图表
    // this.createChart('sellChart');     // 创建图表
    // this.createChart('priceChart');     // 创建图表
  },
  bindEvent() {
    this.mortgageCounter();    // 房贷计算去
  },
  // 初始化头部导航
  initHeaderNav() {
    var nav = new HeaderNav();
    nav.init({
      current: $('.js_header_nav .nav-a').eq(1),    // 当前导航元素
      scrollTop: 200
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
  // 通过楼盘ID获取楼盘数据
  GetModel() {
    GetModel(this.data.estateID, res => {
      let data = res.data;
      data.tag = data._tag.split('|');    // 处理tag
      this.data.estateData = data;    // 保存到data中
      
      // console.log(this.data.estateData)
      document.title = data._estatename;    // 修改title

      this.initNavCrumbs();   // 初始化导航屑
      this.renderEstateInfo();  // 渲染楼盘基本
      this.renderBasicInfo();   // 渲染具体信息
    }, err => {
      _fgj.errorTips('网络错误', '请刷新试试');
    });
  },
  // 渲染楼盘信息
  renderEstateInfo() {
    let html = _fgj.handlebars(tempEstateInfo, this.data.estateData);
    $('.js_estate_info').html(html);

    this.renderEstatePhoto();  // 获取楼盘图片数据
  },
  // 渲染楼盘图片
  renderEstatePhoto() {
    GetListMore({
      num: 5,
      EstateID: this.data.estateID,
    }, res => {
      // console.log(res);
      let data = res.data;
      var html = _fgj.handlebars(tempEstatePhoto, {
        left: data[0],
        right: data.splice(1)
      });
      $('.js_estate_photo').html(html);

      this.GetRecordCount();    // 根据条件获取数据总数
    }, err => {
      $('.js_estate_photo').hide();
    });
  },
  // 根据条件获取数据总数
  GetRecordCount() {
    GetRecordCount({
      PhotoType: '鸟瞰图',
      EstateID: this.data.estateID
    }, 
    res => {
      $('.js_photo_count:last').addClass('active');
      $('.js_photo_count .all-text').html('共有' + res.Count + '张');
    }, 
    err => {
      $('.js_photo_count:last').addClass('active');
      $('.js_photo_count .all-text').html('共有0张');
    })
  },
  // 渲染基本信息
  renderBasicInfo() {
    var html = _fgj.handlebars(tempBasicInfo, this.data.estateData);
    $('#targetInfo').html(html);
    
    this.initMap();   // 初始化地图
    
    setTimeout(() => {
      this.scrollSpy();     // 二级导航联动效果
    }, 300);
  },
  // 渲染经纪人
  renderBroker() {
    getBrokerData(this.data.estateID ,res => {
      // console.log(res)
      let list = res.broker
      var html = _fgj.handlebars(tempBroker, {
        list: list
      });
      $('.js_broker_wrap').html(html);
    });
  },
  // 获取数据分析
  getTargetStat() {
    getTargetStat(this.data.estateID, res => {
      // console.log(res)
    })
  },
  // 渲染价值报告分析
  renderReport() {
    var estateID = this.data.estateID;
    // 里面有两种不同的显示效果，第一种是主推的信息，第二种是一排缩略信息
    // 先第一种
    getReportMainly(estateID, res => {
      // console.log(res)
      var messageList = new MessageList();
      messageList.renderList({
        box: $('.js_report_mainly'),
        list: res.list
      });

      // 点赞
      $('.js_message_like').on('click', function(ev) {
        var e = ev || window.event;
        e.preventDefault();  // 阻止默认事件
      })
    }, err => {
      $('.js_report_mainly').html('请求失败');
    });

    // 第二种
    getReportList(estateID, res => {
      // console.log(res)
      var html = _fgj.handlebars(tempReportList, {
        list: res.list
      });
      $('.js_report_list').html(html);
    }, err => {
      $('.js_report_list').html('请求失败');
    });
  },
  // 渲染在售房源列表
  GetListMoreRoom() {
    GetListMoreRoom({
      num: 4,
      EstateID: this.data.estateID,
    }, 
    res => {
      let data = res.data;
      // this.filter(data, './estate-house-list');   // 对象是应用类型，过滤后可以直接使用
      // console.log(data)
      // 查看更多填入ID
      $('.js_house_more').attr('href', './estate-housing.html?EstateID=' + this.data.estateID);
      // 渲染列表
      var html = _fgj.handlebars(tempSaleHouseList, {
        list: data
      });
      $('.js_house_list').html(html);
    }, 
    err => {
      $('.js_house_list').html(tempEmpty);
    });
  },
  // 过滤数据，添加link
  // filter(data, url) {
  //   data.map(list => {
  //     list.link = url + '.html?EstateID=' + this.data.estateID;
  //   });
  // },
  // 渲染样板房列表
  GetListMoreRoomSample() {
    GetListMoreRoomSample({
      num: 4,
      IsTop: 1,
      EstateID: this.data.estateID,
    }, res => {
      var data = res.data,
          tag = null;
      // 处理tag
      for (let i = 0, leng = data.length; i < leng; i++) {
        if (data[i]._type._tag) {
          tag = data[i]._type._tag.split('|');
          data[i].tag = tag;
        }
      };
      console.log(data)
      // 判断是否有值
      var houseList = new HouseList({
        box: $('.js_house_wrap'),
        list: data
      });
      houseList.renderList();
      // 查看更多户型图
      $('.js_sample_more').attr('href', './estate-house-list.html?EstateID=' + this.data.estateID);
    }, err => {
      $('.js_house_wrap').html(tempEmpty);
    });
  },
  // 二级导航联动效果
  scrollSpy() {
    var subNav = document.getElementById('navbar-example');
    new MenuSpy(subNav);  // 监听滚动
    stickybits(subNav, {
      stickyBitStickyOffset: 64
    }); // 粘性滚动
    anchorScroll();   // 锚点动画
  },
  // 初始化地图
  initMap() {
    var estateData = this.data.estateData;

    var map = new BMap.Map('mapContainer');          // 创建地图实例  
    var point = new BMap.Point(estateData._lng, estateData._lat);  // 创建点坐标  
    map.centerAndZoom(point, 18);                 // 初始化地图，设置中心点坐标和地图级别  
    map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放

    var marker = new BMap.Marker(point);        // 创建标注    
    map.addOverlay(marker);                     // 将标注添加到地图中 

    var traffic = new BMap.TrafficLayer();        // 创建交通流量图层实例      
    map.addTileLayer(traffic);                    // 将图层添加到地图上
  },
  // 创建图表
  createChart(el) {
    var ctx = document.getElementById(el).getContext('2d');
    var myChart = new Chart(ctx, {
      type: 'bar',
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
  // 房贷计算器
  mortgageCounter() {
    var pay = $('#calculator .pay');
  
    $('#calculator .btn-primary').on('click', () => {
      // 这里需要
      setTimeout(() => {
        this.rendCalculatorData();
      }, 30);
    });
  },
  // 渲染房贷计算出来的数据
  rendCalculatorData() {
    var pay = $('#calculator .pay');
    console.log('calculatorData', calculatorData)
    var arr = [];

    for (let key in calculatorData.benjin) {
      arr.push(calculatorData.benjin[key]);
    };

    $('.js_result_pay .pay').each(function (index, item) {
      $(this).html(arr[index])
    });
  } 
};

$(function () {
  estateDetail.init()
});


