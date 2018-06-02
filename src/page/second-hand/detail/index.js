import 'common/js/commonStyle.js';
import './index.scss';

import MoveTo from 'moveto';
import _fgj from 'util/fgj.js';
import HeaderNav from 'components/header-nav/index.js';
import NavCrumbs from 'components/nav-crumbs/index.js';
import Comment from 'components/comment/index.js';

let tempEmpty = require('components/empty/empty.hbs');
let tempBasicInfo = require('./basic-info.hbs');

// 二手房详细
let detail = {
  el: {},
  data: {},
  init() {
    this.onLoad();
    this.bindEvent();
  },
  onLoad() {
    this.rederBasicInfo(); // 渲染基本信息
  },
  bindEvent() {
    this.initSwiper(); // 初始化轮播图
    this.initHeaderNav(); // 导航
    this.initNavCrumbs(); // 导航屑
    this.renderComment(); // 渲染评论
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
  rederBasicInfo() {
    let html = _fgj.handlebars(tempBasicInfo, {
      data: {}
    });
    $('.js_basic_info').html(html);

    this.initMap(); // 初始化地图
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
    console.log(this.Comment)
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
  }
};

$(function () {
  detail.init()
});