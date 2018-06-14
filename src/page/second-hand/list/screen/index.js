import './index.scss';
import _fgj from 'util/fgj.js'; 

let tempIndex = require('./index.hbs');   // 二手房买卖

/**
 * 筛选
 * @class Screen
 * @param { Element } box 容器
 * @param { Function } callParams 修改参数后的回调
 */
export default class Screen {
  constructor() {
    this.el = {};   // 用来存储页面元素
  }

  // 初始化
  init(option) {
    this.option = $.extend({}, option);

    this.renderCom();   // 渲染主体结构
    this.bindEvent();   // 绑定事件
    this.renderPitch();    // 渲染选中的筛选条件
  }

  // 绑定事件
  bindEvent() {
    let option = this.option
  }

  // 渲染主体结构
  renderCom() {
    let option = this.option,
        html   = _fgj.handlebars(tempIndex, {});

    option.box.html(html);
    this.getElement();    // 获取页面元素
  }

  // 获取页面元素
  getElement() {
    this.el.pitch         = $('.js_pitch');
    this.el.pitchCon      = $('.js_pitch_con');
    this.el.searchVal     = $('.js_search_val');
    this.el.searchBtn     = $('.js_search_btn');
    this.el.DistrictName  = $('#DistrictName');
    this.el.SubwayStation = $('#SubwayStation');
  }

  // 触发地铁找房
  onGetSubwayStation(callback) {
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
        callback()
      }
    });
  }

  // 其他筛选功能，专用于下拉
  elses(data, el) {
    let element = $('#' + el),
        params  = this.option.params,
        html    = '';

    for (let i = 0, length = data.length; i < length; i++) {
      if (data[i]._dictionaryvalue === params[el]) {
        html += `<option value="${data[i]._dictionaryvalue}" selected>${data[i]._dictionaryvalue}</option>`
      }
      else {
        html += `<option value="${data[i]._dictionaryvalue}">${data[i]._dictionaryvalue}</option>`
      }
    };
    element.append(html);
    this.onChangeOption(el);    // 添加事件
  }
  // 改变select触发事件
  onChangeOption(el) {
    let element = $('#' + el),
        value = '',
        obj   = {},
        _this = this,
        option= this.option,
        params= this.option.params;

    element.on('change', function() {
      value = $(this).val();

      if (!!value) {
        obj[el] = value
        Object.assign(params, obj);
      } else {
        delete params[el];
      };
      
      params.page = 1;    // 页数还原成 1
      typeof option.callParams === 'function' && option.callParams(params); // 点击筛选后改变参数的回调

      _this.renderPitch();    // 渲染选中的筛选条件
    })
  }

  /**
   * @description 封装筛选功能
   * @param {Object} data  数据 
   * @param {String} el   容器ID
   * @param {String} value   这个值是返回的数据名称，默认是ItemValue
   */
  screenFunction(data, el, value) {
    let element = $('#' + el),
        ItemValue = value || 'ItemValue',
        params = this.option.params,
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
  }

  // 给筛选项添加方法
  screenAddMethods(el) {
    var option  = this.option,
        params  = this.option.params,
        _this   = this,
        element = $('#' + el),
        $this   = null,
        value   = '',
        DistrictName = this.el.DistrictName,
        SubwayStation = this.el.SubwayStation,
        obj     = {};   // 选中的条件

    // 添加方法
    element.find('.l-li').on('click', function () {
      params  = _this.option.params;    // 这里重新获取，切换的时候用到
      $this = $(this);
      value = $this.data('value');

      $this.addClass('active').siblings().removeClass('active');

      // 如果选中的是空，也就是`不限`，就去掉
      if (!!value) {
        obj[el] = value;
        Object.assign(params, obj);
      } else {
        delete params[el];
      };
      
      params.page = 1;    // 页数还原成 1
      
      // 区域和地铁找房，两个只能存在一个
      if (el === 'DistrictName' && params.SubwayStation) {
        delete params.SubwayStation;
        SubwayStation.find('.l-li').removeClass('active').eq(0).addClass('active');
      }
      else if (el === 'SubwayStation' && params.DistrictName) {
        delete params.DistrictName;
        DistrictName.find('.l-li').removeClass('active').eq(0).addClass('active');
      }
      
      typeof option.callParams === 'function' && option.callParams(params); // 点击筛选后改变参数的回调

      _this.renderPitch();    // 渲染选中的筛选条件
    });
  }
  
  // 选中的筛选条件
  renderPitch(option) {
    if (option) {
      this.option.params = option;
    };

    let params    = this.option.params,
        pitch     = this.el.pitch,        // 父容器
        pitchCon  = this.el.pitchCon;    // 内容子容器
        
    // 如果没有选中的筛选条件，就隐藏容器
    if (Object.keys(params).length <= 2) {
      pitch.hide();
      return
    };
    let html = '';
    for (let key in params) {
      // 当前页数page就不显示在选中的条件里了，并且值不能为空
      if ( (key !== 'page' && key !== 'Trade' && key !== 'order') && !!params[key] ) {
        html += `<dd class="l-dd">
                  <div class="box js_pitch_box" data-key="${key}">
                    <span>${params[key]}</span>
                    <svg class="icon" aria-hidden="true">
                      <use xlink:href="#icon-guanbi"></use>
                    </svg>
                  </div>`;
      }
    };
    
    pitchCon.html(html);
    pitch.show();
    this.onRemovePitch();     // 绑定事件，删除选中的筛选条件
  }
  
  // 删除选中的筛选条件
  onRemovePitch() {
    let option = this.option,
        params = this.option.params,
        page = params.page,
        _this = this,
        searchVal = this.el.searchVal,
        key = '';

    $('.js_pitch_box').on('click', function() {
      key = $(this).data('key');
      delete params[key];
      $(this).remove();

      if (Object.keys(params).length <= 2) {
        _this.el.pitch.hide();
      };
      params.page = 1;    // 页数还原成 1

      typeof option.callParams === 'function' && option.callParams(params); // 点击筛选后改变参数的回调
      

      // 如果是清除搜索条件的话，还要清除输入框里的内容
      if (key === 'likestr') {
        searchVal.val('');
      }
      // 如果是清除其他下拉筛选，值设置为''
      else if (key === 'PropertyDecoration' || key === 'PropertyOwn' || key === 'PropertyUsage' || key === 'PropertyTag' || key === 'PropertyDirection' || key === 'Floor') {
        $('#'+ key).val('')
      }
      // 清除class
      else {
        $('#'+ key +' .l-li').eq(0).addClass('active').siblings().removeClass('active');     // 去除选中
      }
    });
  }
  
};