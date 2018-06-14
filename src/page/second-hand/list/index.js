import 'common/js/common.js';
import './index.scss';

import URI from 'urijs';
import MoveTo from 'moveto';
import _fgj from 'util/fgj.js'; 
import HeaderNav from 'components/header-nav/index.js';
import LoaderTimer from 'components/loader-timer/index.js';
import Paging from 'components/paging/index.js';
import _search from './search/index.js'
import Screen from './screen/index.js'
import _list from './item/index.js'

import { GetPageList } from 'api/second-hand/list.js';
import { GetDistrict, GetDictionary } from 'api/public.js';

let tempEmpty = require('components/empty/empty.hbs');

// 二手房列表
let list = {
  el: {
    moveTo    : new MoveTo(),
    trigger   : document.getElementById('handListScreen'),
  },
  data: {
    uri: new URI(window.location.href),    // 当前url地址
    params: {   // 列表
      page: 1,
      Trade: '出售',    // 出售和出租，对应二手房买卖和二手房租赁
    },
    FloorData: [  // 楼层数据
      {
        _dictionaryvalue: '低层'
      }, {
        _dictionaryvalue: '中层'
      }, {
        _dictionaryvalue: '高层'
      },
    ]
  },
  init() {
    this.onLoad();
    this.bindEvent();
  },
  onLoad() {
    this.getParams();   // 获取页面参数
    this.GetPageList();   // 获取列表数据
    this.initScreen();    // 初始化筛选
  },
  bindEvent() {
    this.initHeaderNav();   // 导航
    this.initSearch();    // 搜索  
    this.initSort();    // 排序
    this.onSwitcher();    // 二手房买卖和租赁的切换
  },
  // 获取页面参数
  getParams() {
    let data = this.data;
    data.params = $.extend({}, data.params, data.uri.query(true)); // 整合页面参数
  },
  // 获取列表数据
  GetPageList() {
    GetPageList(this.data.params,
    res => {
      console.log(res)
      this.renderList(res.data);    // 根据数据渲染列表
      this.renderPaging(res.pagecount);  // 根据数据渲染分页
    }, 
    err => {
      $('.js_list').html(tempEmpty);
    });
  },
  // 根据数据渲染列表
  renderList(data) {
    let tag = [];

    for (let i = 0, leng = data.length; i < leng; i++) {
      // 处理tag
      if (data[i]._tag) {
        tag = data[i]._tag.split('|');
        
        data[i].tag = tag;
      };
      // 添加图片路径，测试用
      if (data[i]._pagepic.indexOf('http://') === -1) {
        data[i]._pagepic = _fgj.photoPath() + data[i]._pagepic;
      }
    };

    let list = new _list({
      box: $('.js_list'),
      data: data
    });
  },
  // 二手房买卖和租赁的切换
  onSwitcher() {
    let $deal  = $('.js_deal'),   // 买卖
        $lease = $('.js_lease'),  // 租赁
        $tab   = $('#navSwitch .tab'),
        index  = 0,
        params = this.data.params,
        $this  = null,
        _this  = this;

    $tab.on('click', function() {
      $this = $(this);

      $this.addClass('active').siblings().removeClass('active');
      index = $this.data('index');

      // 去掉已选中筛选条件的class
      params = _this.data.params;
      for (let key in params) {
        if (key && key !== 'page' && key !== 'Trade') {
          $('#' + key).find('.l-li').eq(0).addClass('active').siblings().removeClass('active')
        }
      };

      // 买卖
      if (index === 0) {
        $lease.addClass('hide');
        $deal.removeClass('hide');

        // 切换类型之后，还原筛选，重新获取数据
        _this.data.params = {
          page: 1,
          Trade: '出售',
        }
        _this.GetPageList();
        _this.setUrlParams();    // 修改url地址参数
        _this.Screen.renderPitch(_this.data.params);
      } 
      // 租赁
      else {
        $lease.removeClass('hide');
        $deal.addClass('hide');

        // 切换类型之后，还原筛选，重新获取数据
        _this.data.params = {
          page: 1,
          Trade: '出租',
        }
        _this.GetPageList();
        _this.setUrlParams();    // 修改url地址参数
        _this.Screen.renderPitch(_this.data.params);
      };
    });

    // 根据类型自动切换切换
    if (params.Trade === '出租') {
      $tab.removeClass('active').eq(1).addClass('active');
      $lease.removeClass('hide');
      $deal.addClass('hide');
    }
  },
  // 获取区域数据
  GetDistrict() {
    GetDistrict({
      num: 99,
      CityID: 218
    }, 
    res => {
      this.Screen.screenFunction(res.data, 'DistrictName', '_districtname');
    }, 
    err => {
      $('.DistrictName').html('暂时无信息')
    })
  },
  // 初始化筛选功能
  initScreen() {
    let _this = this;
    this.Screen ? '' : this.Screen = new Screen();
    this.Screen.init({
      box: $('.js_screen'),
      params: this.data.params,
      callParams(params) {    // 修改参数后的回调
        _this.data.params = params;
        _this.GetPageList()     // 重新获取数据
        _this.setUrlParams()    // 修改url地址参数
      }
    });

    // 初始化地铁找房
    this.Screen.onGetSubwayStation(() => {
      this.GetDictionary('SubwayStation');  // 获取地铁数据
    });
    this.GetDistrict();   // 获取区域数据

    this.GetDictionary('PropertyTag', 'else');  // 获取标签数据
    this.GetDictionary('PropertyDecoration', 'else');  // 获取装修数据
    this.GetDictionary('PropertyOwn', 'else');  // 获取产权年限数据
    this.GetDictionary('PropertyUsage', 'else');  // 获取类型数据
    this.GetDictionary('PropertyDirection', 'else');  // 获取朝向数据

    // 无需获取数据，直接添加方法
    this.Screen.screenAddMethods('PriceRang');  // 总价
    this.Screen.screenAddMethods('CountF');   // 居室 | 几房
    this.Screen.screenAddMethods('SquareRang');  // 面积
    this.Screen.screenAddMethods('RentPriceRang');  // 租价
    this.Screen.screenAddMethods('RentType');   // 租房方式
    
    this.Screen.elses(this.data.FloorData, 'Floor'); // 选择楼层
  },
  /**
   * 根据DictionaryNo字段获取对应筛选数据
   * @param {Element} DictionaryNo  id元素
   * @param {String} type  根据类型判断需要调用的方法
   */
  GetDictionary(DictionaryNo, type) {
    GetDictionary({
      num: 99,
      DictionaryNo: DictionaryNo
    }, 
    res => {
      if (type === 'else') {  // 其他筛选是select所以不太一样，
        this.Screen.elses(res.data, DictionaryNo);
      } 
      else {
        this.Screen.screenFunction(res.data, DictionaryNo, '_dictionaryvalue');
      }
    }, 
    err => {
      $('#' + DictionaryNo).html('暂时无信息')
    })
  },
  // 根据数据渲染分页
  renderPaging(pagecount) {
    let params  = this.data.params,
        _this   = this;

    this.Paging ? '' : this.Paging = new Paging();

    this.Paging.init({
      box: $('.js_paging'),
      pagecount: pagecount,   // 总页数
      page: params.page,    // 当前页数
      previous: parseInt(params.page) - 1,  // 上一页的值
      next: parseInt(params.page) + 1, // 下一页的值
      num: 20,
      onSuccess: function (page) {
        params.page = page;
        _this.setUrlParams();  // 修改url地址参数
        _this.GetPageList();  // 获取数据
        _this.el.moveTo.move(_this.el.trigger); // 回到目标位置
      }
    });
  },
  // 解析url，去搜索
  parseURI() {
    this.data.params = $.extend({}, this.data.params, this.data.uri.query(true));   // 获取页面参数
  },
  // 修改url地址参数
  setUrlParams() {
    let uri = this.data.uri,
        params = this.data.params,
        path = new URI(uri.pathname());

    path.query(params);
    history.pushState(null, document.title, path.toString());   // 修改url地址参数
  },
  // 初始化头部导航
  initHeaderNav() {
    var nav = new HeaderNav();
    nav.init({
      current: $('.js_header_nav .nav-a').eq(2)    // 当前导航元素
    })
  },
  // 初始化搜索
  initSearch() {
    let _this = this;
    let search = new _search({
      box: $('.js_search'),
      confirm: function (val) {
        _this.data.params.likestr = val;
        _this.setUrlParams();  // 修改url地址参数
        _this.GetPageList();  // 获取数据
      }
    });
  },
   // 排序
  initSort() {
    let value   = '',
        order   = '',
        _this   = this,
        $this   = null,
        Price   = false,
        Square  = false,
        RegDate = false;

    // 这里的代码有待封装和优化
    $('.js_sort .rank').on('click', function() {
      $this = $(this);
      value = $this.data('value');
      $this.addClass('active').siblings().removeClass('active');
      // 价格
      if (value === 'Price') {
        RegDate = false;
        Square = false;
        Price ? order = 'Price-Asc' : order = 'Price-Desc';
        if (Price) {
          $this.addClass('rotate')
        } else {
          $this.removeClass('rotate')
        }
        Price = !Price
      }
      else if (value === 'Square'){
        Price = false;
        RegDate = false;
        Square ? order = 'Square-Asc' : order = 'Square-Desc';
        if (Square) {
          $this.addClass('rotate')
        } else {
          $this.removeClass('rotate')
        }
        Square = !Square
      }
      else if (value === 'RegDate') {
        Price = false;
        Square = false;
        RegDate ? order = 'RegDate-Asc' : order = 'RegDate-Desc';
        if (RegDate) {
          $this.addClass('rotate')
        } else {
          $this.removeClass('rotate')
        }
        RegDate = !RegDate
      } 
      else {
        order = ''
        Price  = false
        Square  = false
        RegDate  = false
      }
      
      _this.data.params.order = order;
      _this.setUrlParams();  // 修改url地址参数
      _this.GetPageList();  // 获取数据
    });
  }
};

$(function () {
  list.init();
});