import 'common/js/common.js';
import 'components/header-nav/index.scss';
import 'components/footer/index.js'
import './index.scss';

import _fgj from 'util/fgj.js';
var tempTopSwiper = require('./top-swiper.hbs');

// 装修
var fitment = {
  data: {
  },
  init() {
    this.activeHeader();    // 给当前导航加class
    this.getSwiperPhoto();
    this.bindEvent();
  },
  bindEvent() {
  },
  // 获取轮播图数据
  getSwiperPhoto() {
    var html = _fgj.handlebars(tempTopSwiper, {
      photo: [
        {
          pic: 'http://img.88tph.com/homepage/20180305/8396e59fac6f4e42bfe398c17f744066.jpg!fw1200',
          backgroundColor: 'rgb(212, 231, 207)',
        },
        {
          pic: 'http://img.88tph.com/homepage/20180408/601d00a208f0405daa3119d40d01bf2f.jpg!fw1200',
          backgroundColor: 'rgb(194, 241, 252)',
        },
        {
          pic: 'http://img.88tph.com/homepage/20180423/aa188e8a26274a2cb77e0704f3e40fe2.jpg!fw1200',
          backgroundColor: 'rgb(201, 15, 15)',
        }
      ],
    });
    $('.js_swiper_wrap').html(html);
    this.initSwiper();
  },
  // 初始化轮播图
  initSwiper() {
    var _this = this;
    var mySwiper = new Swiper('.js_swiper_wrap', {
      loop: true,
      autoplay: {
        delay: 5000,
        stopOnLastSlide: false,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      }
    });

    $('.swiper-slide, .swiper-btn-arrow').hover(
      function () {
        $('.swiper-btn-arrow').css('display', 'block')
      },
      function () {
        $('.swiper-btn-arrow').css('display', 'none')
      }
    );
  },
  // 给当前导航加class
  activeHeader() {
    $('.nav .nav-a').eq(4).addClass('active');
  },
};

$(function () {
  fitment.init()
});