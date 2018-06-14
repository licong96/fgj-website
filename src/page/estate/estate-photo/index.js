import 'common/js/common.js';
import 'components/header-nav/index.scss';
import 'components/footer/index.js'
import './index.scss';

import _fgj from 'util/fgj.js';
import SubNav from 'components/sub-nav/index.js';
import HeaderNav from 'components/header-nav/index.js';
import NavCrumbs from 'components/nav-crumbs/index.js';

import { GetListMore } from 'api/estate/estate-photo.js';
import { GetModel } from 'api/estate/estate-detail.js';

var tempEstateInfo = require('../estate-detail/estate-info.hbs');
var tempEstatePhoto = require('../estate-detail/estate-photo.hbs');
var tempEmpty = require('components/empty/empty.hbs');
var tempSwiperThumbs = require('./swiper-thumbs.hbs');
var tempPhotoType = require('./photo-type.hbs');
var tempSwiperParent = require('./swiper-parent.hbs');

import 'data/estate/estate-photo-data.js';   // 模拟数据

// 楼盘相册
var estatePhoto = {
  el: {
    aPicture: null,
  },
  data: {
    estateID: _fgj.getUrlParam('EstateID') || (window.location.href = '/estate/estate-list.html'),  // 当前楼盘ID
    estateData: {},   // 楼盘数据
    PhotoType: ['鸟瞰图', '效果图', '规划图', '样板间', '室内图'],    // 图片类型
  },
  init() {
    this.onLoad();
    this.bindEvent();
  },
  onLoad() {
    this.initHeaderNav();  // 给当前导航加class
    this.GetModel();  // 获取楼盘详细数据
    this.renderPhotoType(); // 渲染图片类型
    this.renderSwiperParent();  // 渲染轮播图片的父容器

    // 里面要获取dom节点，放到消息队列中会比较安全
    setTimeout(() => {
      this.renderPhoto();    // 渲染楼盘图片
    }, 30)
  },
  bindEvent() {
    this.rederSubNav();      // 渲染二级导航
    // this.createdVideo();    // 创建视频
  },
  // 初始化头部导航
  initHeaderNav() {
    var nav = new HeaderNav();
    nav.init({
      current: $('.js_header_nav .nav-a').eq(1)    // 当前导航元素
    });
  },
  // 获取楼盘详细数据
  GetModel() {
    GetModel(this.data.estateID, res => {
      let data = res.data;
      data.tag = data._tag.split('|');    // 处理tag
      this.data.estateData = data;    // 保存到data中
      
      document.title = data._estatename + '相册';    // 修改title

      this.initNavCrumbs();   // 初始化导航屑
      this.renderEstateInfo();  // 渲染楼盘基本
    }, err => {
      _fgj.errorTips('网络错误', '请刷新试试');
    });
  },
  // 渲染楼盘信息
  renderEstateInfo() {
    let html = _fgj.handlebars(tempEstateInfo, this.data.estateData);
    $('.js_estate_info').html(html);
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
  // 渲染二级导航
  rederSubNav() {
    let estateID = this.data.estateID;
    let subNav = new SubNav({
      box: $('.js_sub_nav'),
      list: [
        {
          name: '楼盘详情',
          href: './estate-detail.html?EstateID=' + estateID,
        }, {
          name: '楼盘相册',
          href: './estate-photo.html?EstateID=' + estateID,
          active: true
        }, {
          name: '在售房源',
          href: './estate-housing.html?EstateID=' + estateID,
        }, {
          name: '户型列表',
          href: './estate-house-list.html?EstateID=' + estateID,
        },
      ]
    });
    subNav.renderList();
  },
  // 轮播
  swiper(number) {
    let galleryTop = new Swiper(number + '.gallery-top', {
      spaceBetween: 10,
      loop: false,
      loopedSlides: 5, //looped slides should be the same
      navigation: {
        nextEl: number + '.swiper-button-next',
        prevEl: number + '.swiper-button-prev',
      },
      pagination: {
        el: number + '.swiper-pagination',
        type: 'fraction',
      },
    });
    var galleryThumbs = new Swiper(number + '.gallery-thumbs', {
      spaceBetween: 10,
      slidesPerView: 4,
      touchRatio: 0.2,
      loop: false,
      loopedSlides: 5, //looped slides should be the same
      slideToClickedSlide: true,
      navigation: {
        nextEl: number + '.next-small',
        prevEl: number + '.prev-small',
      },
    });
    galleryTop.controller.control = galleryThumbs;
    galleryThumbs.controller.control = galleryTop;
  },
  // 渲染图片类型的标题
  renderPhotoType() {
    var html = _fgj.handlebars(tempPhotoType, {
      list: this.data.PhotoType
    });
    $('.js_pic_btn').html(html);
  },
  // 渲染轮播图片的父容器
  renderSwiperParent() {
    var html = _fgj.handlebars(tempSwiperParent, {
      list: this.data.PhotoType
    });
    $('.js_swiper_wrap').html(html);
  },
  // 渲染楼盘图片
  renderPhoto() {
    let PhotoType = this.data.PhotoType,
        // 记录哪个选项被加载过
        obj = { 
          'key0': true
        },
        key = '', // 存储键
        aLink = $('.js_pic_btn .nav-item'),
        aPicture = this.el.aPicture = $('.js_swiper_wrap .picture-list');

    this.getPhoto(0, PhotoType[0]);   // 默认加载第一个选项

    // 添加事件，切换图片类型
    for (let i = 0; i < aLink.length; i++) {
      aLink.eq(i).on('click', () => {
        aLink.eq(i).addClass('active').siblings().removeClass('active');
        aPicture.eq(i).addClass('active').siblings().removeClass('active');

        key = 'key' + i;
        if (!obj[key]) {
          obj[key] = true;
          this.getPhoto(i, PhotoType[i]);
        }
      });
    };
  },
  // 获取图片数据
  getPhoto(i, select) {
    let aPicture = this.el.aPicture;
    GetListMore({
      num: 99,
      PhotoType: select,
      EstateID: this.data.estateID
    }, 
    res => {
      // console.log(res)
      let html = _fgj.handlebars(tempSwiperThumbs, {
        list: res.data
      });
      aPicture.eq(i).html(html);

      this.swiper('.picture_' + i + ' ');   // 渲染轮播
      this.onMouseShowBtn();
    }, 
    err => {
      $('.picture_' + i).html(tempEmpty);
    });
  },
  // 鼠标经过轮播，显示左右按钮
  onMouseShowBtn() {
    $('.gallery-top').hover(
      function () {
        $('.swiper-btn-arrow').css('opacity', '1')
      },
      function () {
        $('.swiper-btn-arrow').css('opacity', '0')
      }
    )
  },
  // 初始化播放器
  createdVideo() {
    let player = videojs('myPlayer');
  }
};

$(function () {
  estatePhoto.init();
});