import 'common/js/common.js';
import 'components/footer/index.js'
import './index.scss';

import stickybits from 'stickybits';
import _fgj from 'util/fgj.js'; 
import HeaderNav from 'components/header-nav/index.js';
import MessageList from 'components/message-list/index.js'; 
import NavCrumbs from 'components/nav-crumbs/index.js';
import LoaderTimer from 'components/loader-timer/index.js';

import {
  GetListMoreMessage, 
  classifyGetListMore 
} from 'api/message/message-home.js';
import { 
  GetPageList
} from 'api/message/message-list.js';

var tempNavPills = require('./nav-pills.hbs');
var tempSwiperSlide = require('./swiper-slide.hbs');
var tempEmpty = require('components/empty/empty.hbs');

// 资讯列表
var messageLists = {
  el: {
    loader: null,   // 加载中
  },
  data: {
    NewsClassName: '',  // 分类名称
    param: {    // 获取分页数据
      page: 1,
      likestr: '',
      NewsClassID: _fgj.getUrlParam('NewsClassID') || (window.location.href = './message-home.html'),
      order: '',    // 排序
    },
    uri: new URI(window.location.href),    // 当前url地址
  },
  init() {
    this.onLoad();
    this.bindEvent();
  },
  onLoad() {
    this.initHeaderNav();  // 给当前导航加class
    this.getHotList();   // 获取头部最热门的资讯
    this.getclassif();   // 获取所有分类
    this.GetPageList();   // 获取当分类数据
  },
  bindEvent() {
    this.initLoaderTimer();   // 初始化加载中
    this.onNavPills();    // 分类导航切换
    this.onSort();    // 排序
    this.onSearch();    // 搜索
    // this.onStickyRecom();   // 右侧一周热文粘性滑动
  },
  // 初始化头部导航
  initHeaderNav() {
    var nav = new HeaderNav();
    nav.init({
      current: $('.js_header_nav .nav-a').eq(3)    // 当前导航元素
    });
  },
  // 获取头部最热门的资讯
  getHotList() {
    let loader = this.el.loader;

    GetListMoreMessage({
      num: 3,
      IsTop: 1,
      NewsClassID: this.data.param.NewsClassID,
      RegDate: 'DESC'
    }, res => {
      // console.log(res)
      loader && loader.hide();
      this.filter(res.data);
      var html = _fgj.handlebars(tempSwiperSlide, {
        list: res.data
      });
      $('.js_swiper_wrap').html(html);

      this.createSwiper();    // 创建轮播
    }, err => {
      loader && loader.hide();
      $('.js_swiper_wrap').html('');    // 没有数据就清空掉轮播
    });
  },
  // 获取所有分类
  getclassif() {
    classifyGetListMore({
      num: 9
    }, res => {
      // console.log(res)
      var list = res.data;

      // 保存分类名称，并且给当前类别加一个 active
      let NewsClassID = this.data.param.NewsClassID;
      for (let i = 0; i < list.length; i++) {
        if (list[i]._newsclassid === NewsClassID) {
          list[i].active = 'active';  // 给当前元素添加class
          this.data.NewsClassName = list[i]._classname;
          break
        }
      };
      
      // 渲染分类导航
      var navPills = _fgj.handlebars(tempNavPills, {
        list: list
      });
      $('.js_nav_pills').html(navPills);

      this.renderNavCrumbs();  // 渲染导航屑
    }, err => {
      $('.js_nav_pills').html('获取分类数据失败，尝试刷新试试');
    });
  },
  // 获取当分类数据
  GetPageList() {
    // console.log(this.data.param)
    let param = this.data.param;
    GetPageList(param, res => {
      this.filter(res.data);    // 把数据拼接在一起

      let list = new MessageList();
      list.renderList({
        box: $('.js_data_list'),
        list: res.data
      });
    }, err => {
      $('.js_data_list').html(tempEmpty)
    })
  },
  // 过滤数据
  filter(data) {
    data.map(list => {
      list.link = './message-detail.html?NewsID=' + list._newsid + '&NewsClassID=' + list._newsclassid;   // 添加link跳转和参数
    });
  },
  // 渲染导航屑
  renderNavCrumbs() {
    let NewsClassName = this.data.NewsClassName;

    let listData = [
      {
        name: '资讯首页',
        link: './message-home.html'
      }, {
        name: NewsClassName
      }
    ];
    let html = new NavCrumbs();
    html.renderList({
      box: $('.js_nav_crumbs'),
      list: listData
    });
  },
  // 分类导航切换
  onNavPills() {
    let param = this.data.param,
        newsclassid = '',
        _this = this,
        loader = this.el.loader;

    $(document).on('click', '.js_nav_item', function () {
      newsclassid = $(this).data('newsclassid');
      // 如果点击的是同一个选项，就不做操作
      if (param.NewsClassID === newsclassid) {
        return false;
      };
      loader.show();
      $(this).addClass('active').siblings().removeClass('active');
      param.NewsClassID = newsclassid;   // 修改 NewsClassID
      _this.GetPageList();  // 重新获取数据
      _this.getHotList();   // 获取头部最热门的资讯
      _this.setUrlParams();   // 修改地址栏参数
    });
  },
  // 创建轮播
  createSwiper() {
    var _this = this;
    var mySwiper = new Swiper('.js_message_list', {
      loop: false,
      // 如果需要前进后退按钮
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
  // 排序
  onSort() {
    let _this = this,
        param = this.data.param,
        value = '',   // 排序值
        line = $('.js_sort .line');   // 下划线

    $('.js_sort .best').on('click', function () {
      value = $(this).data('value');
      if (param.order === value) {
        return
      };
      // 下滑线
      if (value === 'Click') {
        line.css({
          left: '50%'
        })
      } else {
        line.css({
          left: '0'
        })
      };
      $(this).addClass('active').siblings().removeClass('active');
      param.order = value;
      _this.GetPageList();    // 筛选后再次获取数据
    });
  },
  // 搜索
  onSearch() {
    let val = $('.js_search_val'),   // 存储搜索值
        btn = $('.js_search_btn'),
        _this = this,
        param = this.data.param;
    
    // 点击搜索
    btn.on('click', function () {
      param.likestr = val.val();
      _this.GetPageList();    // 筛选后再次获取数据
    });
    // 回车搜索
    val.keydown(function(e) {
      if (e.keyCode === 13) {
        param.likestr = val.val();
        _this.GetPageList();    // 筛选后再次获取数据
      }
    });
  },
  // 修改url地址参数
  setUrlParams() {
    var uri = this.data.uri,
        NewsClassID = this.data.param.NewsClassID,
        path = new URI(uri.pathname());

    // 添加参数
    path.query({
      NewsClassID: NewsClassID
    });
    history.pushState(null, document.title, path.toString());   // 修改url地址参数
  },
  // 右侧一周热文粘性滑动
  onStickyRecom() {
    var recom = document.getElementById('recom');
    stickybits(recom, {
      stickyBitStickyOffset: 10
    });
  },
  // 初始化加载中
  initLoaderTimer() {
    this.el.loader = new LoaderTimer();
    this.el.loader.render({
      box: $('.js_loader_time'),
    });
  }
};

$(function () {
  messageLists.init()
});