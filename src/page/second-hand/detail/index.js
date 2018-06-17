import 'common/js/common.js';
import './index.scss';

import MoveTo from 'moveto';
import _fgj from 'util/fgj.js';
import HeaderNav from 'components/header-nav/index.js';
import NavCrumbs from 'components/nav-crumbs/index.js';
import Comment from './comment/index.js';
import Login from 'components/login/index.js';
import HintTop from 'components/hint-top/index.js';

import { 
  GetModelDetail, 
  GetAboutProperty, 
  GetPropertyPhoto,
  GetPropertyComment,
  AddPropertyComment,
} from 'api/second-hand/detail.js';

let tempEmpty     = require('components/empty/empty.hbs');
let tempTopInfo   = require('./top-info.hbs');
let tempSwiper    = require('./swiper.hbs');
let tempBasicInfo = require('./basic-info.hbs');
let tempMainInfo  = require('./main-info.hbs');
let tempLikeList  = require('./like-list.hbs');

// 二手房详细
let detail = {
  el: {
    moveTo: new MoveTo({ tolerance: 65 }),
  },
  data: {
    PropertyID: _fgj.getUrlParam('PropertyID') || (window.location.href = './list.html'),
    PropertyData: {}, // 主体数据
    propertyPhoto: [],  // 图片数据集合
  },
  init() {
    this.onLoad();
    this.bindEvent();
  },
  onLoad() {
    this.GetModelDetail();    // 获取主体数据
    this.GetPropertyPhoto();  // 获取图片数据
    this.GetCommentData();   // 获取评论数据
  },
  bindEvent() {
    this.initHeaderNav(); // 导航
    this.initHintTop(); // 初始化提示功能
  },
  // 获取主体数据
  GetModelDetail() {
    GetModelDetail({
      PropertyID: this.data.PropertyID
    }, 
    res => {
      this.filterData(res.data);    // 处理数据
      
      this.data.PropertyData = res.data;

      let top = _fgj.handlebars(tempTopInfo, res.data);
      $('.js_top_info').html(top);

      let main = _fgj.handlebars(tempMainInfo, res.data);
      $('.js_main_info').html(main);

      let basic = _fgj.handlebars(tempBasicInfo, res.data);
      $('.js_basic_info').html(basic);

      this.initNavCrumbs(); // 初始化导航屑
      this.initMap(); // 初始化地图
      this.onLookTel();   // 查看电话号码
      this.renderComment();   // 添加锚点链接

      this.GetAboutProperty();  // 获取相关房源 | 猜你喜欢
    }, 
    err => {
      $('.js_main_info').html(tempEmpty);
      $('.js_basic_info').html(tempEmpty);
    })
  },
  // 处理数据
  filterData(data) {
    // 处理tag
    if (data._tag) {
      data.tag = data._tag.split('|');
    }
  },
  // 获取图片数据
  GetPropertyPhoto() {
    let type    = ['户型图', '室内图', '小区图'],
        photo   = this.data.propertyPhoto,
        num     = 0;    // 记录当前发送了多少个请求

    for (let i = 0, length = type.length; i < length; i++) {
      // 户型图
      GetPropertyPhoto({
        num: 999,
        PropertyID: this.data.PropertyID,
        PhotoType: type[i]
      }, 
      res => {
        num++
        res.data.forEach((item) => {
          item.path = _fgj.photoPath() + item._path
          item.smallpath = _fgj.photoPath() + item._smallpath
          photo.push(item);
        });
        // 可以去渲染了
        if (num >= type.length) {
          this.renderSwiper();  // 渲染轮播容器
        }
      }, 
      err => {
        num++
      });
    };
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
    let data = this.data.PropertyData;

    let listData = [{
        name: '二手房',
        link: './list.html'
      },
      {
        name:  data._trade ==='出售'? '二手房买卖' : '二手房租赁',
        link: data._trade ==='出售'? './list.html' : './list.html?Trade=出租'
      },
      {
        name: data._propertytitle
      }
    ];
    let html = new NavCrumbs();
    html.renderList({
      box: $('.js_nav_crumbs'),
      list: listData,
      hideCode: true
    });
  },
  // 渲染轮播容器
  renderSwiper() {
    let data = this.data.propertyPhoto;
    let html = _fgj.handlebars(tempSwiper, {
      list: this.data.propertyPhoto
    });
    $('.js_swiper_wrap').html(html);
    this.initSwiper();
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
  // 初始化地图
  initMap() {
    let data = this.data.PropertyData;

    if (!data._lat) {
      return
    }

    var map = new BMap.Map('mapContainer');          // 创建地图实例  
    var point = new BMap.Point(data._lng, data._lat);  // 创建点坐标  
    map.centerAndZoom(point, 16);                 // 初始化地图，设置中心点坐标和地图级别  
    map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放

    var marker = new BMap.Marker(point);        // 创建标注    
    map.addOverlay(marker);                     // 将标注添加到地图中 

    var traffic = new BMap.TrafficLayer();        // 创建交通流量图层实例      
    map.addTileLayer(traffic);                    // 将图层添加到地图上
  },
  // 评论锚点链接
  renderComment() {
    let box = $('.js_comment');

    // 锚点链接
    $('.line-comment').on('click', () => {
      this.el.moveTo.move(box[0]);
    });
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
      let data        = res.data,
          arr         = [],
          PropertyID  = this.data.PropertyID;

      data.forEach((item) => {
        // 相关推荐，要排除自己本身，不然成何体统
        if (PropertyID !== item._propertyid) {
          item.path = _fgj.photoPath() + item._pagepic;
          arr.push(item);
        }
      });
      if (arr.length) {
        let html = _fgj.handlebars(tempLikeList, {
          list: arr
        });
        $('.js_you_like').html(html);
        $('.js_like_wrap').removeClass('hide');
      }
    });
  },
  // 查看电话号码
  onLookTel() {
    let _this = this,
        data  = this.data.PropertyData,
        $btn  = $('.js_look_tel');

    this.Login = new Login();
    
    $btn.on('click', () => {

      if (!_fgj.getCookie('CUserID')) {
        this.Login.init({
          success: function () {
            _this.HintTop.success('登陆成功！');
            data._user._tel ? $btn.html(data.data._user._tel) : $btn.html('暂无电话');
          }
        });
      } else {
        data._user._tel ? $btn.html(data.data._user._tel) : $btn.html('暂无电话');
      }
    });
  },
  // 初始化提示功能
  initHintTop() {
    this.HintTop ? '' : this.HintTop = new HintTop();
  },
  // 获取评论数据
  GetCommentData() {
    let _this = this,
        page = 1;

    this.Comment = new Comment();
    this.Comment.init({
      box: $('.js_comment'),
      page: page,
      GetPropertyComment(page) {    // 获取评论
        GetPropertyComment({
          page: page,
          PropertyID: _this.data.PropertyID
        }, 
        res => {
          _this.Comment.successFul(res.data);
        }, 
        err => {
          _this.Comment.empty(err);
        })
      },
      AddPropertyComment(content, CommentGroup, ToUserID) {    // 发布评论
        AddPropertyComment({
          Content: content,
          CommentGroup: CommentGroup, // 评论组,不是回复则不传
          PropertyID: _this.data.PropertyID,
          ToUserID: ToUserID // 回复用户id,不是回复则不传
        }, 
        res => {
          _fgj.successTips('发布成功');
          this.GetPropertyComment(1);
        },
        err => {
          if (err.msg === '请先登录！') {
            _this.Login.init({
              success: function () {
                // console.log(content, CommentGroup, ToUserID)
                _this.HintTop.success('登陆成功！');
              }
            });
          } else {
            _fgj.errorTips('评论失败');
          }
        })
      }
    });
  }
};

$(function () {
  detail.init()
});