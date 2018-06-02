import 'common/js/commonStyle.js';
import './index.scss';

import MoveTo from 'moveto';
import _fgj from 'util/fgj.js'; 
import HeaderNav from 'components/header-nav/index.js';
import NavCrumbs from 'components/nav-crumbs/index.js';

let tempEmpty = require('components/empty/empty.hbs');

// 二手房详细
let detail = {
  el: {
  },
  data: {
  },
  init() {
    this.onLoad();
    this.bindEvent();
  },
  onLoad() {
  },
  bindEvent() {
    this.initSwiper();      // 初始化轮播图
    this.initHeaderNav();   // 导航
    this.initNavCrumbs();   // 导航屑
  },
  // 初始化头部导航
  initHeaderNav() {
    var nav = new HeaderNav();
    nav.init({
      current: $('.js_header_nav .nav-a').eq(2)    // 当前导航元素
    })
  },
  // 初始化导航屑
 initNavCrumbs() {
   let listData = [
     {
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
};

$(function () {
  detail.init()
});