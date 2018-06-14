import 'common/js/common.js';
import 'components/footer/index.js'
import './index.scss';

import MoveTo from 'moveto';
import _fgj from 'util/fgj.js'; 
import HeaderNav from 'components/header-nav/index.js';
import EstateList from 'components/estate-list/index.js'; 
import Tag from 'components/tag/index.js';
import LoaderTimer from 'components/loader-timer/index.js';
import Paging from 'components/paging/index.js';

import {
  GetListMore,
  GetPageList,
  GetListMoreDistrict,
  GetSubwayStation,
  GetEstateUsage,
} from 'api/estate/estate-list.js';
import { GetListVarchar } from 'api/public.js';

var tempTopSwiper = require('./top-swiper.hbs');
var tempTopBtn = require('./top-btn.hbs');
var tempEmpty = require('components/empty/empty.hbs');

import 'data/estate/estate-list-data.js'   // 模拟数据


// 楼盘列表
var estateList = {
  el: {
    mySwiper      : null,   // 轮播对象
    moveTo        : new MoveTo(),
    trigger       : document.getElementById('estateListScreen'),
    pitch         : $('.js_pitch'),
    pitchCon      : $('.js_pitch_con'),
    searchVal     : $('.js_search_val'),   // 搜索
    searchBtn     : $('.js_search_btn'),
    DistrictName  : $('#DistrictName'),
    SubwayStation : $('#SubwayStation'),
  },
  data: {
    uri: new URI(window.location.href),    // 当前url地址
    params: {   // 筛选参数
      page: 1,
      // DistrictName: '',  // 区域
      // PriceRang: '',   // 价格区间（格式：0-100）
      // PropertyUsage: '',   // 类型
      // Tag: '',   // 标签
      // likestr: '',   // 搜索
    },
    estateDataList: '',   // 楼盘列表
  },
  init() {
    this.onLoad();
    this.bindEvent();
  },
  onLoad() {
    this.parseURI();    // 解析url
    this.initHeaderNav();  // 初始化头部导航

    this.GetListMore();   // 获取楼盘数据
    this.GetPageList();   // 获取楼盘列表数据

    this.GetListMoreDistrict();  // 区域筛选
    this.GetTag();    // 获取标签数据
    this.GetEstateUsage();  // 类型筛选

    // this.onScreenPrice(); // 价格筛选
  },
  bindEvent() {
    this.onGetSubwayStation();    // 地铁找房
    this.onSearch();    // 搜索
    this.onScreenPrice(); // 价格筛选
    this.createLoaderTimer();   // 创建加载中
  },
  // 解析url，去搜索
  parseURI() {
    this.data.params = $.extend({}, this.data.params, this.data.uri.query(true));   // 获取页面参数
    console.log(this.data.params)
    // console.log(uri.query(true))
    // console.log(this.data.uri.pathname())

    // this.data.uri.query({
    //   page: '2',
    //   name: 'lc',
    //   tel: '13699531996'
    // });
    // console.log(uri.hasQuery('page'))
    // console.log(uri.toString());
    // console.log(this.data.uri)
    // setTimeout(() => {
    //   console.log(this.data.uri.toString())
    //   history.pushState(null, document.title, 'estate.html')
    // }, 3000);
    this.initPitch();    // 选中的筛选条件
    // this.setUrlParams();  // 修改url地址参数
  },
  // 修改url地址参数
  setUrlParams() {
    var uri = this.data.uri,
        params = this.data.params,
        path = new URI(uri.pathname());

    console.log(params);
    path.query(params);
    history.pushState(null, document.title, path.toString());   // 修改url地址参数
  },
  // 初始化头部导航
  initHeaderNav() {
    var nav = new HeaderNav();
    nav.init({
      current: $('.js_header_nav .nav-a').eq(1)    // 当前导航元素
    })
  },
  // 获取楼盘数据
  GetListMore() {
    GetListMore({
      num: 4,
      IsTop: 1,
      IsOnline: 1
    }, res => {
      // console.log(res)
      let data = res.data,
          tag = [];
      // 处理tag
      for (let i = 0, leng = data.length; i < leng; i++) {
        if (data[i]._tag) {
          tag = data[i]._tag.split('|');
          data[i].tag = tag;
        }
      };
      var html = _fgj.handlebars(tempTopSwiper, {
        list: data
      });
      $('.js_swiper_estate').html(html);
      
      setTimeout(() => {
        this.initSwiper();    // 初始化轮播图
        this.onswiperBtn(data);   // 楼盘轮播切换按钮
      }, 30);
    }, err => {
      $('.js_swiper_estate').html(tempEmpty);
    })
  },
  // 楼盘轮播切换按钮
  onswiperBtn(data) {
    let btnGroup = $('.js_swiper_btn'),
        val = '',
        mySwiper = this.el.mySwiper,
        list = [];

    // 根据数据长度，创建按钮个数
    for (let i = 0, leng = data.length; i < leng; i++) {
      list.push({
        index: i,
        name: data[i]._estatename
      });
    };
    list[0].active = 'active';    // 默认选中第一个
    var html = _fgj.handlebars(tempTopBtn, {
      list: list
    });
    $('.js_swiper_btn').html(html);
    
    // 给按钮添加事件，添加到消息队列中
    setTimeout(() => {
      $('.js_swiper_btn .btn').on('click', function () {
        val = $(this).data('index');
        $(this).addClass('active').siblings().removeClass('active');
        mySwiper.slideTo(val);
      });
    }, 30);
  },
  // 获取楼盘列表数据
  GetPageList() {
    var params = this.data.params;
    GetPageList(params, res => {
      // console.log(res)
      this.renderEstateList(res.data);    // 渲染楼盘列表
      this.renderPaging(res);     // 渲染分页
    }, err => {
      $('.js_estate_list').html(tempEmpty);
    });
  },
  // 渲染楼盘列表
  renderEstateList(list) {
    list.map((item) => {
      let tag = item._tag.split('|');
      let arr = [];
      // 处理tag
      tag.forEach((item) => {
        let answer = item
        let leng = item.indexOf(',')
        if (leng !== -1) {
          answer = item.substr(0, leng)
        }
        answer ? arr.push(answer) : ''
      })
      item.tag = arr
      return item
    });
    
    var html = new EstateList({
      box: $('.js_estate_list'),
      list: list
    });
    html.renderList();
  },
  // 渲染分页
  renderPaging(data) {
    let params = this.data.params,
        _this  = this;
        
    this.Paging ? '' : this.Paging = new Paging();

    this.Paging.init({
      box: $('.js_paging'),
      pagecount: data.pagecount,   // 总页数
      page: params.page,    // 当前页数
      previous: parseInt(params.page) - 1,  // 上一页的值
      next: parseInt(params.page) + 1, // 下一页的值
      num: 20,
      onSuccess: function (page) {
        // console.log(page)
        params.page = page;
        _this.setUrlParams();  // 修改url地址参数
        _this.GetPageList();  // 获取数据
        _this.el.moveTo.move(_this.el.trigger); // 回到顶部
      }
    });
  },
  // 获取区域数据
  GetListMoreDistrict() {
    GetListMoreDistrict({
      num: 99,
      CityID: 218,
    }, 
    res => {
      this.screenFunction(res.data, 'DistrictName', '_districtname');
    }, 
    err => {
      $('#DistrictName').html('网络错误，没有拿到相关数据，可以刷新重试');
    });
  },
  // 获取标签数据
  GetTag() {
    GetListVarchar({
      num: 99,
      DictionaryNo: 'EstateTag'
    }, 
    res => {
      this.screenFunction(res.data, 'Tag', '_dictionaryvalue');
    }, 
    err => {
      $('#Tag').html('网络错误，没有拿到相关数据，可以刷新重试');
    })
  },
  // 筛选价格，没有去获取数据，默认状态不一样
  onScreenPrice() {
    var params = this.data.params,
        priceLi = $('#Price .l-li');

    // 如果有的话添加默认选中状态
    if (!!params.PriceRang) {
      for (let i = 0; i < priceLi.length; i++) {
        var current = priceLi.eq(i)
        if (current.data('value') === params.PriceRang) {
          current.addClass('active').siblings().removeClass('active');
        }
      }
    };

    this.screenAddMethods('PriceRang');   // 添加方法
  },
  // 获取类型数据
  GetEstateUsage() {
    GetEstateUsage({
      num: 99,
      DictionaryNo: 'EstateUsage'
    },
    res => {
      // console.log(res)
      this.screenFunction(res.data, 'PropertyUsage', '_dictionaryvalue');
    }, 
    err => {
      $('#PropertyUsage').html('网络错误，没有拿到相关数据，可以刷新重试');
    })
  },
  // 触发地铁找房
  onGetSubwayStation() {
    let DistrictName  = this.el.DistrictName,
        SubwayStation = this.el.SubwayStation,
        isOne         = false,
        _this         = this,
        $this         = null;
    
    $('.js_location_select .l-li').on('click', function () {
      $this = $(this);
      $this.addClass('active').siblings().removeClass('active');

      if ($this.data('index') === 0) {
        DistrictName.show();
        SubwayStation.hide();
      }
      else {
        SubwayStation.show();
        DistrictName.hide();
      };

      // 去获取数据
      if (!isOne) {
        isOne = true;
        _this.GetSubwayStation();
      }
    });
  },
  // 获取地铁找房数据
  GetSubwayStation() {
    GetSubwayStation({
      num: 99,
      DictionaryNo: 'SubwayStation'
    }, 
    res => {
      // console.log(res)
      this.screenFunction(res.data, 'SubwayStation', '_dictionaryvalue');
    }, 
    err => {
      this.el.SubwayStation.html('网络错误，没有拿到相关数据，可以刷新重试')
    })
  },
  /**
   * @description 封装筛选功能
   * @param {Object} res  数据 
   * @param {String} el   容器
   * @param {String} value   这个值是返回的数据名称，默认是ItemValue
   */
  screenFunction(res, el, value) {
    var data = res,
        element = $('#' + el),
        ItemValue = value || 'ItemValue',
        params = this.data.params,
        html = `<li class="l-li active" data-value="">
                  <span class="m-a">不限</span>
                </li>`;   // 默认不限

    for (let i = 0; i < data.length; i++) {
      // 默认选中的条件，添加active，用了一个很笨的方法
      if (data[i][ItemValue] === params[el]) {
        setTimeout(() => {
          // 注意，li还不存在，需要加到事件队列里去，这里要加 `1` ，因为有不限这个选项
          element.find('.l-li').eq(i + 1).addClass('active').siblings().removeClass('active');
        }, 30);
      };
      html += `<li class="l-li" data-value="${data[i][ItemValue]}">
                <span class="m-a">${data[i][ItemValue]}</span>
              </li>`;
    };
    element.html(html);
    
    // 给筛选项添加方法
    this.screenAddMethods(el);
  },
  // 给筛选项添加方法
  screenAddMethods(el) {
    var params  = this.data.params,
        _this   = this,
        element = $('#' + el),
        $this   = null,
        value   = '',
        obj     = {};   // 选中的条件

    // 添加方法
    element.find('.l-li').on('click', function () {
      $this = $(this);
      value = $this.data('value');

      $this.addClass('active').siblings().removeClass('active');

      // 如果选中的是空，也就是`不限`，就去掉价格
      if (!!value) {
        obj[el] = value
        Object.assign(params, obj);
      } else {
        delete params[el];
      };
      params.page = 1;    // 页数还原成 1
      
      // 区域和地铁找房，两个只能存在一个
      if (el === 'DistrictName' && params.SubwayStation) {
        delete params.SubwayStation
      }
      else if (el === 'SubwayStation' && params.DistrictName) {
        delete params.DistrictName
      }
      
      // 渲染筛选条件之前，有个判断，区域和地铁两个只能选一个
      _this.setUrlParams();  // 修改url地址参数
      _this.GetPageList();  // 获取数据
      _this.initPitch();    // 选中的筛选条件
    });
  },
  // 选中的筛选条件
  initPitch() {
    var params = this.data.params;
    var pitch = this.el.pitch;          // 父容器
    var pitchCon = this.el.pitchCon;    // 内容子容器
    // 如果没有选中的筛选条件，就隐藏容器
    if (Object.keys(params).length <= 1) {
      pitch.hide();
      return
    };
    var html = '';
    for (var key in params) {
      // 当前页数page就不显示在选中的条件里了，并且值不能为空
      if (key !== 'page' && !!params[key]) {
        html += `<dd class="l-dd">
                  <div class="box js_pitch_box" data-key="${key}">
                    <span>${params[key]}</span>
                    <svg class="icon" aria-hidden="true">
                      <use xlink:href="#icon-guanbi"></use>
                    </svg>
                  </div>`;
      }
    };
    // html += `
    //     <div class="box js_clear">
    //       <span>清空筛选</span><svg class="icon" aria-hidden="true">
    //         <use xlink:href="#icon-guanbi"></use>
    //       </svg>
    //     </div>`
    pitchCon.html(html);
    pitch.show();
    this.onRemovePitch();     // 绑定事件，删除选中的筛选条件
  },
  // 删除选中的筛选条件
  onRemovePitch() {
    var params = this.data.params,
        page = params.page,
        _this = this,
        searchVal = this.el.searchVal,
        key = '';

    $('.js_pitch_box').on('click', function() {
      key = $(this).data('key');
      delete params[key];
      $(this).remove();
      if (Object.keys(params).length <= 1) {
        _this.el.pitch.hide();
      };
      params.page = 1;    // 页数还原成 1

      _this.setUrlParams();  // 修改url地址参数
      _this.GetPageList();  // 重新获取数据
      
      $('#'+ key +' .l-li').eq(0).addClass('active').siblings().removeClass('active');     // 去除选中
      // 如果是清除搜索条件的话，还要清除输入框里的内容
      if (key === 'likestr') {
        searchVal.val('');
      }
    });
  },
  // 创建加载中
  createLoaderTimer() {
    this.LoaderTimer ? '' : (this.LoaderTimer = new LoaderTimer());
    this.LoaderTimer.render({
      box: $('.js_loader')
    });
  },
  // 搜索
  onSearch() {
    let val = this.el.searchVal,   // 存储搜索值
        btn = this.el.searchBtn,
        _this = this,
        fnTrigger = null,
        params = this.data.params;
    
    // 点击搜索
    btn.on('click', function () {
      fnTrigger();
    });
    // 回车搜索
    val.keydown(function(e) {
      if (e.keyCode === 13) {
        fnTrigger();
      }
    });

    fnTrigger = function () {
      params.likestr = val.val();
      if (params.likestr) {
        params.page = 1;    // 触发搜索之后，页数还原为 1
        _this.GetPageList();    // 再次获取数据
        _this.initPitch();    // 选中的筛选条件
        _this.setUrlParams();  // 修改url地址参数
      }
    };
  },
  // 初始化轮播图
  initSwiper() {
    let _this = this,
        btn = null,
        record = {key0: true};

    this.el.mySwiper = new Swiper('.js_swiper_estate', {
      loop: false,
      // 如果需要前进后退按钮
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      on: {
        slideChangeTransitionEnd: function () {
          // 滑动的时候，按钮同步切换
          btn = $('.js_swiper_btn .btn');
          btn && btn.eq(this.activeIndex).addClass('active').siblings().removeClass('active');

          // let index = this.activeIndex;
          // let key = 'key' + index;
          // // 只创建一次
          // if (!record[key]) {
          //   record[key] = true;
          //   // _this.createChart('topChart' + index);     // 创建图表  
          // }
        }
      }
    });
    // this.createChart('topChart0');     // 轮播初始化后创建第一个图表
 
    $('.swiper-slide, .swiper-btn-arrow').hover(
      function () {
        $('.swiper-btn-arrow').css('display', 'block')
      },
      function () {
        $('.swiper-btn-arrow').css('display', 'none')
      }
    );
  },
  // 创建图表
  createChart(el) {
    var ctx = document.getElementById(el).getContext('2d');
    this.data['chart' + el] = new Chart(ctx, {
      type: 'line',
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
};

$(function () {
  estateList.init()
});