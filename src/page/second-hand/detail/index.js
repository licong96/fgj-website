import 'common/js/commonStyle.js';
import './index.scss';

import MoveTo from 'moveto';
import _fgj from 'util/fgj.js';
import HeaderNav from 'components/header-nav/index.js';
import NavCrumbs from 'components/nav-crumbs/index.js';
import Comment from 'components/comment/index.js';
import Login from 'components/login/index.js';
import HintTop from 'components/hint-top/index.js';

import { GetModelDetail, GetAboutProperty } from 'api/second-hand/detail.js';

let tempEmpty = require('components/empty/empty.hbs');
let tempBasicInfo = require('./basic-info.hbs');
let tempMainInfo = require('./main-info.hbs');
let tempLikeList = require('./like-list.hbs');

// 二手房详细
let detail = {
  el: {},
  data: {
    PropertyID: _fgj.getUrlParam('PropertyID') || (window.location.href = './list.html'),
    PropertyData: {}, // 主体数据
  },
  init() {
    this.onLoad();
    this.bindEvent();
  },
  onLoad() {
    this.GetModelDetail();    // 获取主体数据
    // this.renderBasicInfo(); // 渲染基本信息渲染基本信息
    this.GetAboutProperty();  // 获取相关房源 | 猜你喜欢
  },
  bindEvent() {
    this.initSwiper(); // 初始化轮播图
    this.initHeaderNav(); // 导航
    this.initNavCrumbs(); // 导航屑
    this.renderComment(); // 渲染评论
    this.initLogin();   // 初始化登陆
    this.onLookTel();   // 查看电话号码
    this.initHintTop(); // 初始化提示功能
  },
  // 获取主体数据
  GetModelDetail() {
    GetModelDetail({
      PropertyID: this.data.PropertyID
    }, 
    res => {
      console.log(res)

      let main = _fgj.handlebars(tempMainInfo, res.data);
      $('.js_main_info').html(main);

      let basic = _fgj.handlebars(tempBasicInfo, res.data);
      $('.js_basic_info').html(basic);

      
      this.initMap(); // 初始化地图
    }, 
    err => {
      $('.js_main_info').html(tempEmpty);
      $('.js_basic_info').html(tempEmpty);
    })
  },
  // 初始化头部导航
  initHeaderNav() {
    var nav = new HeaderNav();
    nav.init({
      current: $('.js_header_nav .nav-a').eq(2) // 当前导航元素
    })
  },
  // 初始化导航屑
  initNavCrumbs() {
    let listData = [{
        name: '二手房',
        link: './list.html'
      },
      {
        name: '二手房买卖',
        link: './list.html'
      },
      {
        name: '二手房详细'
      }
    ];
    let html = new NavCrumbs();
    html.renderList({
      box: $('.js_nav_crumbs'),
      list: listData,
      hideCode: true
    });
  },
  // 初始化轮播图
  initSwiper() {
    let galleryTop = new Swiper('.gallery-top', {
      spaceBetween: 10,
      loop: false,
      loopedSlides: 5, //looped slides should be the same
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      pagination: {
        el: '.swiper-pagination',
        type: 'fraction',
      },
    });
    var galleryThumbs = new Swiper('.gallery-thumbs', {
      spaceBetween: 10,
      slidesPerView: 4,
      touchRatio: 0.2,
      loop: false,
      loopedSlides: 5, //looped slides should be the same
      slideToClickedSlide: true,
      navigation: {
        nextEl: '.next-small',
        prevEl: '.prev-small',
      },
    });
    galleryTop.controller.control = galleryThumbs;
    galleryThumbs.controller.control = galleryTop;

    $('.gallery-top').hover(
      function () {
        $('.swiper-btn-arrow').css('opacity', '1')
      },
      function () {
        $('.swiper-btn-arrow').css('opacity', '0')
      }
    )
  },
  // 渲染基本信息
  renderBasicInfo() {
    let html = _fgj.handlebars(tempBasicInfo, {
      data: {}
    });
    $('.js_basic_info').html(html);

  },
  // 初始化地图
  initMap() {
    var estateData = {
      _lng: 12.04,
      _lat: 19.96
    }

    var map = new BMap.Map('mapContainer');          // 创建地图实例  
    var point = new BMap.Point(estateData._lng, estateData._lat);  // 创建点坐标  
    map.centerAndZoom(point, 3);                 // 初始化地图，设置中心点坐标和地图级别  
    map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放

    var marker = new BMap.Marker(point);        // 创建标注    
    map.addOverlay(marker);                     // 将标注添加到地图中 

    var traffic = new BMap.TrafficLayer();        // 创建交通流量图层实例      
    map.addTileLayer(traffic);                    // 将图层添加到地图上
  },
  // 渲染评论
  renderComment() {
    this.Comment || (this.Comment = new Comment());
    this.Comment.init({
      box: $('.js_comment')
    });

    this.renderCommentList();   // 渲染评论列表数据
  },
  // 渲染评论列表数据
  renderCommentList() {
    this.Comment.renderListMsg({
      box: $('.js_comment_list'),
      data: [
        {}, {}, {}
      ]
    })
  },
  // 获取相关房源 | 猜你喜欢
  GetAboutProperty() {
    let data = this.data.PropertyData;

    GetAboutProperty({
      num: 4,
      EstateID: data._estateid,
      DistrictID: data._districtid,
    }, 
    res => {
      console.log(res)
      let html = _fgj.handlebars(tempLikeList, {
        list: res.data
      });
      $('.js_you_line').html(html);
    }, 
    err => {
      $('.js_you_line').html(tempEmpty);
    });
  },
  // 初始化登陆
  initLogin() {
    this.Login = new Login();
    // this.Login.init();
  },
  // 查看电话号码
  onLookTel() {
    let _this = this;
    
    $('.js_look_tel').on('click', () => {
      this.Login.init({
        success: function () {
          _this.HintTop.show({
            type: 'success',
            text: '登陆成功！'
          })
        }
      });
    });
  },

  // 初始化提示功能
  initHintTop() {
    this.HintTop ? '' : this.HintTop = new HintTop();
  },
};

$(function () {
  detail.init()
});