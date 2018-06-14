import 'common/js/common.js';
import 'components/footer/index.js'
import './index.scss';

import _fgj from 'util/fgj.js';
import HeaderNav from 'components/header-nav/index.js';

// 装修详细
var fitmentDetail = {
  data: {
  },
  init() {
    this.onLoad();
    this.bindEvent();
  },
  onLoad() {
    this.initHeaderNav();  // 初始化头部导航
    this.initSwiper();
  },
  bindEvent() {
  },
  // 初始化头部导航
  initHeaderNav() {
    var nav = new HeaderNav();
    nav.init({
      current: $('.js_header_nav .nav-a').eq(4)    // 当前导航元素
    })
  },
  initSwiper() {
    var galleryTop = new Swiper('.gallery-center', {
      loop: false,
      loopedSlides: 3, //looped slides should be the same
      spaceBetween: 10,
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
      loop: false,
      loopedSlides: 3,
      spaceBetween: 10,
      slidesPerView: 4,
      touchRatio: 0.2,
      slideToClickedSlide: true,

      direction : 'vertical',
      navigation: {
        nextEl: '.next-small',
        prevEl: '.prev-small',
      },
    });
    galleryTop.controller.control = galleryThumbs;
    galleryThumbs.controller.control = galleryTop;

    // 右侧推荐
    var galleryRight = new Swiper('.gallery-right', {
      slidesPerView: 4,
      spaceBetween: 10,
      direction : 'vertical',
      navigation: {
        nextEl: '.next-small-right',
        prevEl: '.prev-small-right',
      },
    });

    // 中间图片，鼠标移入显示箭头
    $('.gallery-center').hover(
      function () {
        $('.swiper-btn-arrow').css('opacity', '1')
      },
      function () {
        $('.swiper-btn-arrow').css('opacity', '0')
      }
    )
  }
};

$(function () {
  fitmentDetail.init()
});