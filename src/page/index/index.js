import 'common/js/common.js';
import 'components/footer/index.js'
import './index.scss';

import _fgj from 'util/fgj.js';
import HeaderNav from 'components/header-nav/index.js';
import 'util/jquery.waypoints.js';

import { GetListMore } from 'api/estate/estate-list.js';
import { GetListMoreMessage } from 'api/message/message-home.js';

var tempHotEstate = require('./hot-estate.hbs');
var tempHotMessage = require('./hot-message.hbs');
var tempEmpty = require('components/empty/empty.hbs');

// 首页
var home = {
  data: {
  },
  init() {
    this.onLoad();
    this.bindEvent();
  },
  onLoad() {
    this.initHeaderNav();   // 初始化头部导航
    this.GetListMore();   // 获取热门楼盘 
    this.GetListMoreMessage();   // 获取热门资讯
  },
  bindEvent() {
    this.onSearch();    // 搜索功能
  },
  // 初始化头部导航
  initHeaderNav() {
    var nav = new HeaderNav();
    nav.init({
      current: $('.js_header_nav .nav-a').eq(0)    // 当前导航元素
    })
  },
  // 搜索功能
  onSearch() {
    let aOpt = $('.js_search_opt .s-opt');   // 搜索类别
    let value = $('.js_search_val');    // 搜索内容
    let submit = $('.js_search_sub');   // 搜索按钮
    let optVal = '';    // 选中的类别

    // 给类别加切换
    aOpt.on('click', function () {
      $(this).addClass('active').siblings().removeClass('active');
      optVal = $(this).data('value');
    });

    // 添加搜索事件
    value.on('click', function () {

    });
  },
  // 监听元素是否到可视区
  initWaypoint() {
    let estateElement = $('#hotEstate');
    let messageElement = $('#hotMessage');
    let analyzeElement = $('#analyze');
    let _this = this;
    let one = false;    // 创建一次

    // 监听楼盘到可视区
    var estate = new Waypoint({
      element: estateElement,
      handler: function(direction) {
        $(this.element).find('.swiper-slide').eq(0).addClass('animation');
      },
      offset: '70%'
    });

    // 监听资讯到可视区
    var message = new Waypoint({
      element: messageElement,
      handler: function(direction) {
        $(this.element).addClass('animation');
      },
      offset: '70%'
    });

    // 监听市场分析报告到可视区
    var message = new Waypoint({
      element: analyzeElement,
      handler: function(direction) {
        $(this.element).addClass('animation');

        // 道可视区就创建图表
        if (one) {
          return
        }
        one = true;
        let chart = $('#analyze .chart');
        
        for (let i = 0; i < chart.length; i++) {
          _this.initChart($(chart).eq(i))
        }
      },
      offset: '70%'
    });
  },
  // 获取热门楼盘
  GetListMore(){
    GetListMore({
      num: 4
    },
    res => {
      let data = res.data;

      this.filterEstateData(data);    // 过滤楼盘数据
      
      var html = _fgj.handlebars(tempHotEstate, {
        list: data
      });
      $('#hotEstate').html(html);

      this.initSwiper();    // 初始化轮播图
      this.initWaypoint();  // 监听元素是否到可视区
    },
    err => {
      $('#hotEstate').html(tempEmpty);
    });
  },
  // 过滤楼盘数据
  filterEstateData(data) {
      let tag = [];
      for (let i = 0, leng = data.length; i < leng; i++) {
        // 处理tag
        if (data[i]._tag) {
          tag = data[i]._tag.split('|');
          data[i].tag = tag;
        };
        // 截取介绍长度
        if (data[i]._estateintro) {
          data[i].estateintro = data[i]._estateintro.substring(0, 160) + '......';
        }
      }
  },
  // 获取热门资讯
  GetListMoreMessage() {
    GetListMoreMessage({
      num: 4,
      IsTop: 1,
      RegDate: 'DESC'
    },
    res => {
      console.log(res.data)
      let data = res.data;
      data.forEach(item => {
        item.shortcontent = item._shortcontent.substring(0, 60) + '...';
      });
      var html = _fgj.handlebars(tempHotMessage, {
        left: data[0],
        list: data.splice(1)
      });
      $('#hotMessage').html(html);
    },
    err => {
      $('#hotMessage').html(tempEmpty);
    });
  },
  initSwiper() {
    let slide = null;
    var swiper = new Swiper('.swiper-container', {
      // spaceBetween: 30,
      // loop: true,
      effect: 'fade',
      // effect: 'fade',
      fadeEffect: {
        crossFade: true,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      on: {
        // init:function(swiper){
        //   slide = this.slides.eq(0);
			  //   slide.addClass('animation');
		    // },
        slideChangeTransitionEnd() {
          slide = this.slides.eq(this.activeIndex);
          $(slide).addClass('animation').siblings().removeClass('animation')
        }
      }
    });
  },
  // 市场分析报告图表
  initChart(ctx) {
    let _this = this;
    var chartColors = {
      red: 'rgb(255, 99, 132)',
      orange: 'rgb(255, 159, 64)',
      yellow: 'rgb(255, 205, 86)',
      green: 'rgb(75, 192, 192)',
      blue: 'rgb(54, 162, 235)',
      purple: 'rgb(153, 102, 255)',
      grey: 'rgb(201, 203, 207)'
    };
    
    var config = {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [
            _this.randomScalingFactor(),
            _this.randomScalingFactor(),
            _this.randomScalingFactor(),
            _this.randomScalingFactor(),
            _this.randomScalingFactor(),
          ],
          backgroundColor: [
            chartColors.red,
            chartColors.orange,
            chartColors.yellow,
            chartColors.green,
            chartColors.blue,
          ],
          label: 'Dataset 1'
        }],
        labels: [
          'Red',
          'Orange',
          'Yellow',
          'Green',
          'Blue'
        ]
      },
      options: {
        responsive: true,
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: '标题'
        },
        animation: {
          animateScale: true,
          animateRotate: true
        }
      }
    };
    setTimeout(() => {
      let chart = new Chart(ctx, config);
    }, 1000)
  },
  // 随机数据
  randomScalingFactor() {
    return Math.round(Math.random() * 100);
  }
};

$(function () {
  home.init()
});
